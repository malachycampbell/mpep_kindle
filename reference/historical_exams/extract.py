#!/usr/bin/env python3
"""Extract structured question/answer JSON from the historical exam PDFs in this directory.

Phase 2 (extraction only, no current-law audit) -- see manifest.json's
current_law_caveat and open_items_for_next_session.

Usage: python3 extract.py
Requires: pdftotext (poppler) on PATH.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).parent
SESSIONS = ["2002-10-16", "2003-04-15", "2003-10-15"]
PARTS = ["am", "pm"]

HEADER_FOOTER_RE = re.compile(
    r"^\s*\d{1,2}/\d{1,2}/\d{4}\s+USPTO\s+Reg\.\s+Exam\..*$"
    r"|^\s*THIS PAGE INTENTIONALLY LEFT BLANK\s*$"
    r"|^\s*\(Morning|\(Afternoon.*Session.*\)\s*$"
    r"|^\s*\d{1,3}\s*$"  # standalone page-number line
    r"|^\s*(Morning|Afternoon) Session \(Nbr\..*$"
    # running header repeated on every answer-key page, e.g.
    # "April 15, 2003 Examination   Afternoon Session Model Answers"
    r"|^\s*[A-Za-z]+ \d{1,2},\s*\d{4}\s+Examination\s+(Morning|Afternoon) Session Model Answers\s*$",
    re.IGNORECASE,
)
# A question/answer number starts a new entry only when it appears at column 0
# (no leading whitespace) -- choice lines and wrapped continuation text in the
# answer-key PDFs are never indented that way in this source, but they also
# never happen to start with "<digits>. " at the true left margin.
# \d{1,2} caps entry numbers at 1-99 (sessions only go up to 50) and the
# negative lookahead rejects "706.02(c)" / "2163.06"-style MPEP/CFR section
# citations that happen to start a wrapped line -- both would otherwise be
# misread as a new question/answer boundary.
QUESTION_START_RE = re.compile(r"^(\d{1,2})\.(?!\d)\s*(.*)$")
CHOICE_RE = re.compile(r"^\s+\(([A-E])\)\s+(.*)$")
ANSWER_START_RE = QUESTION_START_RE


def pdf_to_text(pdf_path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        capture_output=True, text=True, check=True,
    )
    return result.stdout


def clean_lines(raw_text: str) -> list[str]:
    lines = []
    for line in raw_text.splitlines():
        if HEADER_FOOTER_RE.match(line):
            continue
        lines.append(line)
    return lines


def parse_questions(raw_text: str) -> dict[int, dict]:
    lines = clean_lines(raw_text)
    questions: dict[int, dict] = {}
    current_num = None
    current_stem: list[str] = []
    current_choice = None
    current_choices: dict[str, list[str]] = {}

    def flush_question():
        if current_num is not None:
            questions[current_num] = {
                "number": current_num,
                "stem": " ".join(current_stem).strip(),
                "choices": {k: " ".join(v).strip() for k, v in current_choices.items()},
            }

    for line in lines:
        if not line.strip():
            continue
        m_q = QUESTION_START_RE.match(line)
        if m_q:
            flush_question()
            current_num = int(m_q.group(1))
            current_stem = [m_q.group(2)]
            current_choice = None
            current_choices = {}
            continue
        m_choice = CHOICE_RE.match(line)
        if m_choice:
            letter, text = m_choice.groups()
            current_choice = letter
            current_choices[letter] = [text]
            continue
        if current_num is None:
            continue  # stray line before the first question
        if current_choice is not None:
            current_choices[current_choice].append(line.strip())
        else:
            current_stem.append(line.strip())

    flush_question()
    return questions


def parse_answers(raw_text: str) -> dict[int, dict]:
    lines = clean_lines(raw_text)
    answers: dict[int, dict] = {}
    current_num = None
    current_text: list[str] = []

    def flush():
        nonlocal current_num, current_text
        if current_num is not None:
            full = " ".join(current_text).strip()
            all_credit = bool(re.match(r"CREDIT GIVEN FOR ALL ANSWERS|All answers (were )?accepted", full, re.IGNORECASE))
            answer = None
            if not all_credit:
                # The stated answer letter is always the first "(A)"-"(E)"
                # occurring shortly after "ANSWER:" -- phrasing varies
                # ("ANSWER: (C) is..." / "ANSWER: Choice (C) is..." /
                # "ANSWER: The most correct answer is (C)."), but a fixed
                # search window after the "ANSWER:" marker avoids matching a
                # later parenthetical (e.g. a lowercase "(a)" CFR subsection
                # or a distractor discussed further down) instead.
                after = re.sub(r"^ANSWER:\s*", "", full, flags=re.IGNORECASE)
                letter_match = re.search(r"\(([A-E])\)", after[:100])
                answer = letter_match.group(1) if letter_match else None
            answers[current_num] = {
                "number": current_num,
                "answer": "ALL" if all_credit else answer,
                "rationale": full,
            }
        current_num = None
        current_text = []

    for line in lines:
        if not line.strip():
            continue
        m = ANSWER_START_RE.match(line)
        if m:
            flush()
            current_num = int(m.group(1))
            current_text = [m.group(2)]
            continue
        if current_num is not None:
            current_text.append(line.strip())

    flush()
    return answers


def merge(questions: dict[int, dict], answers: dict[int, dict], session_date: str, part: str) -> list[dict]:
    numbers = sorted(set(questions) | set(answers))
    merged = []
    for n in numbers:
        q = questions.get(n, {})
        a = answers.get(n, {})
        merged.append({
            "session_date": session_date,
            "part": part,
            "number": n,
            "stem": q.get("stem"),
            "choices": q.get("choices"),
            "answer": a.get("answer"),
            "rationale": a.get("rationale"),
            "parse_warnings": [
                w for w in [
                    None if n in questions else "missing from questions PDF",
                    None if n in answers else "missing from answers PDF",
                    None if not q.get("choices") else (
                        None if set(q["choices"]) >= {"A", "B", "C", "D"} else "fewer than 4 choices parsed"
                    ),
                ] if w
            ],
        })
    return merged


def main():
    out_dir = BASE / "extracted"
    out_dir.mkdir(exist_ok=True)
    total_warnings = 0
    for session in SESSIONS:
        for part in PARTS:
            q_pdf = BASE / session / f"{part}_questions.pdf"
            a_pdf = BASE / session / f"{part}_answers.pdf"
            if not q_pdf.exists() or not a_pdf.exists():
                print(f"SKIP {session} {part}: missing PDF", file=sys.stderr)
                continue
            questions = parse_questions(pdf_to_text(q_pdf))
            answers = parse_answers(pdf_to_text(a_pdf))
            merged = merge(questions, answers, session, part)
            out_path = out_dir / f"{session}_{part}.json"
            out_path.write_text(json.dumps(merged, indent=2))
            warnings = sum(len(item["parse_warnings"]) for item in merged)
            total_warnings += warnings
            print(f"{session} {part}: {len(merged)} questions, {warnings} parse warnings -> {out_path.relative_to(BASE)}")
    print(f"\nTotal parse warnings across all sessions: {total_warnings}")


if __name__ == "__main__":
    main()
