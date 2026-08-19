# Build Spec: Static MPEP Study PDFs (Track 1 — Chapter Build Pass)

This describes exactly what I'm doing to generate each chapter's study PDF, validated against the MPEP §§2103–2106 (patent eligibility) pilot. Use this as the reference/prompt for building the next chapter, and update it whenever a new preference is set so it stays the single source of truth for the format.

## Why this exists
Materials must be fully static and pregenerated — no live AI interaction required to use them, since study happens offline during a commute. Each chapter becomes a standalone PDF, downloaded once over WiFi, readable on a phone or tablet with any PDF viewer.

## Source of truth
Content is built from the user's uploaded current MPEP PDF (`/mnt/user-data/uploads/MPEP_combined.pdf`), not from general knowledge. Process per chapter/section:
1. Extract the relevant section's text from the uploaded MPEP using `pdftotext -layout`.
2. Confirm section boundaries (start/end line) by grepping for the MPEP's own section-number headers (e.g. `§ 2107` marks the end of the §2103–2106 eligibility block) — don't guess boundaries.
3. Build rule cards, examples, and quiz content from that extracted text, translated into plain English — not copied verbatim.
4. Flag to the user that they should spot-check anything with a specific legal test, number, or citation against their own MPEP copy.

## Scope per PDF
One MPEP chapter is often too large for a single sensible deliverable (Chapter 2100 alone runs ~34,000 lines of extracted text and covers §101, §102, §103, and §112). Default to one PDF per natural sub-topic within a chapter (e.g., "§2103–2106: Eligibility" as its own PDF, "§2107: Utility" as the next, etc.) rather than forcing an entire MPEP chapter into one file. Confirm scope before building if it's ambiguous.

## Locked format (as of the eligibility pilot)

**Cover page:** title, subtitle naming the MPEP sections covered, a short note on the plain-English/example/quiz format, and an accuracy disclaimer pointing back to the user's own MPEP.

**Per rule card:**
- Heading: `Rule N: [Name] (§[MPEP section])`
- **PLAIN ENGLISH** — one label + 2–5 sentences translating the rule out of legalese, bolding key terms.
- **EXAMPLE** — one realistic fact pattern (shaded box) showing the rule applied, ideally with a "trap" or edge case.
- **QUIZ** — one multiple-choice question (4 options) testing application, not just recall. **No answer shown here.**
- No inline answer. All answers are collected and printed together in a single **Answer Key** section at the very end of the PDF (this was a direct correction from the default — originally answers were placed right under each question; moved to the end per user feedback so the read-through isn't interrupted and self-testing works better).

**Chapter close-out:** a 5–8 question mixed practice set pulling from all rule cards in that PDF, mimicking exam-style cross-topic mixing. Answers also deferred to the end-of-PDF Answer Key, not printed immediately after the set.

**Memorize list:** a bullet list of the key tests/terms/thresholds worth committing to memory from that PDF, placed after the close-out quiz and before the Answer Key.

**Answer Key (final section of the PDF):** two parts — "Rule-Card Quizzes" (question restated in condensed form + answer + explanation) and "Chapter Close-Out Quiz" (numbered answer + explanation) — both fully consolidated at the end so nothing is visible mid-read.

**Visual style:** color-coded shaded boxes (pale yellow for examples, pale green for answers), bold blue section labels, generous line spacing and ~10.5–11pt body text sized for phone/tablet reading. Built with reportlab; every labeled block (label + its content) is grouped with `KeepTogether` so nothing gets orphaned across a page break.

## Packaging
One PDF per chapter/sub-topic, delivered via `present_files` immediately after building.

## Process checklist per new chapter/section
1. Extract and bound the section from the uploaded MPEP.
2. Build rule cards + close-out set + memorize list + consolidated answer key, following the locked format above.
3. Render page previews (`pdftoppm`) and visually check at least the cover, a rule-card page, and the answer key pages for spacing/overlap issues before delivering.
4. Deliver via `present_files`.
5. Ask what to adjust before continuing to the next chapter, and fold any new preference into this spec.

## Remaining chapter queue (Track 1)
- §2107 — Utility
- §2110s — Prior Art / §102 (novelty, both AIA and pre-AIA)
- §2140s — Obviousness / §103
- §2160s — §112 (written description, enablement, definiteness)
- Chapter 700 — Examination of Applications
- Chapter 800 — Restriction
- Chapter 600 — Parts, Form, and Content of Applications
- Chapter 1200 — Appeal
- Chapter 1300 — Allowance and Issue
- Chapter 1400 — Correction of Patents
- Chapter 1800 — PCT
- Chapter 2200 — Citation of Prior Art / Ex Parte Reexamination
- Chapter 2300 — Interference/Derivation

## Track 2 (Thematic Drill Pass) — not yet started
Still queued for after the Track 1 chapters are built, and after a full practice exam. Same static/offline/PDF constraint applies. Format not yet locked — to be designed and piloted the same way Track 1 was, once Track 1 is far enough along.
