# Flashcard bank (Phase 3)

This is the flashcard content produced from the Phase 2 current-law audit of
`reference/historical_exams/` (see `reference/historical_exams/audit/METHODOLOGY.md`
for how each of the 300 historical exam questions was assessed). Phase 3 turns
those audit results into promoted, current-law-accurate flashcards. This pass
covers content only -- no GitHub Pages interface yet (see root `README.md`
project-status table).

## Promotion policy

Per question `current_law_status` from the audit files:

- **STILL_VALID** -- promoted as-is. The stem, choices, answer, and
  explanation are carried over from the original exam question with only
  copyediting (no legal-content changes), since the audit already confirmed
  the doctrine and citations are unchanged under current law.
- **PARTIALLY_OBSOLETE** -- promoted, but rewritten. Every stale citation or
  term identified by the audit note (and cross-checked again against the
  current MPEP corpus in `mpep_build/`) is updated in the stem, choices, and
  explanation to its current form (e.g. "Board of Patent Appeals and
  Interferences" -> "Patent Trial and Appeal Board", "35 U.S.C. 112, first
  paragraph" -> "35 U.S.C. 112(a)", "37 CFR 1.137(b)" -> "37 CFR 1.137").
  The underlying legal point being tested is preserved exactly; only the
  surface citations/terminology change. Each card's `revisions` field lists
  what was changed, so the rewrite can be checked against the original in
  `reference/historical_exams/extracted/`.
- **OBSOLETE** -- excluded from this pass. The tested legal framework no
  longer applies (overwhelmingly pre-AIA doctrine), so a faithful "update"
  would require writing a new question from scratch rather than editing an
  existing one. These are left out of `bank.json` entirely; a future pass
  could author new current-law questions on the same topics, but that is
  original content creation, not promotion, and is out of scope here.
- **Flawed/no-single-answer questions** -- a small number of original exam
  questions received credit for multiple or all answer choices (the original
  USPTO answer key noted the question was flawed/ambiguous), independent of
  current-law status. These are excluded regardless of `current_law_status`
  and listed in `skipped.json` with a reason, since a flashcard needs a
  single defensible correct answer.

## Schema (`bank.json`)

A JSON array of card objects:

```json
{
  "id": "2002-10-16-am-001",
  "source": { "session_date": "2002-10-16", "part": "am", "number": 1 },
  "current_law_status": "STILL_VALID",
  "question": "...",
  "choices": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
  "answer": "C",
  "explanation": "...",
  "revisions": [],
  "audit_ref": "reference/historical_exams/audit/2002-10-16_audit.json#am-1"
}
```

- `revisions` is an empty array for STILL_VALID cards, and a list of short
  strings describing each specific change for PARTIALLY_OBSOLETE cards (e.g.
  `"'Board of Patent Appeals and Interferences' -> 'Patent Trial and Appeal
  Board' in explanation"`).
- `answer` is normally a single letter; a few original questions have a
  multi-letter correct answer set (e.g. "(B) and (D)") which is preserved
  verbatim as it appeared in the original.
- `audit_ref` points back to the specific audit-file entry that justified
  promotion, so a reviewer can trace any card back to its original audit
  reasoning without re-deriving it.

`skipped.json` is a JSON array of `{ "id", "reason" }` for excluded
flawed/ambiguous questions (see above); OBSOLETE questions are not separately
listed here since they're already identifiable via the audit files.

## GitHub Pages interface

`../docs/` is the study interface (`docs/index.html`, `docs/app.js`,
`docs/styles.css`) that GitHub Pages serves. It reads its data from
`docs/data/bank.json`, which is a **copy** of this `bank.json` (GitHub Pages
can only serve files under the configured Pages source folder, so the app
can't fetch `../flashcards/bank.json` directly). After editing `bank.json`,
re-sync the copy:

```
cp flashcards/bank.json docs/data/bank.json
```

Progress (per-card review state) is stored client-side in the browser's
`localStorage`, not in this repo.

## Known limitations

Same caveats as `reference/historical_exams/audit/METHODOLOGY.md`: this is
LLM-driven legal-content analysis, not review by a registered patent
practitioner. Every PARTIALLY_OBSOLETE rewrite should be spot-checked against
the original question and the current MPEP text before being relied upon,
and STILL_VALID cards carry the same residual risk as the underlying audit
determination.
