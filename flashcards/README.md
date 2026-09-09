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

## Foundations deck (`foundations.json`)

`bank.json` (above) is the **advanced/assessment layer** — historical Patent
Bar questions that assume a working vocabulary of patent practice. Because
that assumption made the bank unusable for a beginner (see the "Patent
Practice Foundations" plan/session that introduced this file), `foundations.json`
is a separate, **original** deck of short vocabulary/concept flashcards
teaching the language and mental model of U.S. patent practice, so the
historical bank becomes readable. It is intentionally never merged into
`bank.json` — the two decks stay in separate files with different schemas,
and the app loads and tags them separately (`deck: "foundation"` vs.
`deck: "historical"`).

### Schema (`foundations.json`)

A JSON array of card objects:

```json
{
  "id": "foundation-system-vocabulary-001",
  "deck": "foundation",
  "topic": "system-vocabulary",
  "subtopic": "agency-and-authority",
  "level": 0,
  "card_type": "qa",
  "question": "What is the USPTO?",
  "answer_text": "...",
  "why_it_matters": null,
  "choices": null,
  "answer": null,
  "explanation": null,
  "sources": [
    { "authority": "35 U.S.C.", "citation": "35 U.S.C. 1(a)", "as_of": "Rev. 01.2024 (Nov. 2024)" }
  ]
}
```

- `id` scheme: `foundation-<topic-slug>-<3-digit>`.
- `level`: `0` = pure vocabulary, `1` = concept/rule requiring a definition
  of a definition, `2` = reserved for future "bridge" multiple-choice
  questions (simple MCQs using only vocabulary already taught, as a stepping
  stone toward the historical bank — mostly unpopulated in this initial
  release).
- `card_type`: `"qa"` (short question → short answer, self-graded like
  Flashcards mode always was) or `"mcq"` (reuses the *same*
  `choices`/`answer`/`explanation` shape as `bank.json` verbatim, so it works
  in Quiz mode too). A `qa` card sets `choices`/`answer`/`explanation` to
  `null`; an `mcq` card sets `answer_text`/`why_it_matters` to `null`.
- `why_it_matters`: optional, 1-2 sentences, used **sparingly** — only when
  a card's relevance genuinely isn't obvious from the definition alone
  (e.g., comparison cards). Most pure-vocabulary cards should leave this
  `null`; don't pad every card with one "for completeness."
- `sources[]`: every card must cite at least one real, checked source —
  `authority` (`"35 U.S.C."` / `"37 CFR"` / `"MPEP"` / `"USPTO"`), `citation`
  (the actual section/provision), and optionally `as_of` (the MPEP
  revision the citation was checked against) and `url`. No source, no card.

### Sourcing policy

Every card must trace to primary or USPTO-affiliated authority, checked
against the files already in this repo — **not** generated from general
LLM knowledge and **not** treated as authoritative merely because a
simplified note already exists in `markdown_chapter_summaries/` (those are
explicitly non-authoritative drafts; useful only as a pointer to a real
MPEP section number to go check).

1. **Tier 1 — statute/regulation**: `reference/usc/usc_title_35_mpep_appx_l.pdf`
   (35 U.S.C.) and `reference/cfr/cfr_title_37_mpep_appx_r.pdf` (37 C.F.R.),
   both pinned to the MPEP 9th Edition, Rev. 01.2024 (Nov. 2024) snapshot —
   same edition this repo's whole audit process is anchored to. Don't fetch
   live uscode.house.gov/ecfr.gov text; that would drift ahead of the
   tested edition.
2. **Tier 2 — MPEP**: `reference/mpep/` / `pdfs/` / `mpep_build/` (same
   Rev. 01.2024 text).
3. **Tier 3 — official USPTO educational material** (Patent Basics, STEPP,
   etc.): used only for supplementary plain-English framing, never for the
   legal definition itself, and only via a live fetch (nothing like this
   exists locally) with the URL and retrieval date recorded on the card's
   `sources[]` entry.

### Topic taxonomy

Cards are grouped by `topic` (a slug) into a mental-model-based curriculum,
not MPEP chapter order — see the "Patent Practice Foundations" plan for the
full 9-topic breakdown (system vocabulary; application anatomy; application
types/family; prosecution lifecycle; claims & §112; patentability & prior
art; deadlines & procedure; appeals/PCT/post-grant; reading exam questions).
`docs/app.js` derives the topic filter checkboxes dynamically from whatever
`topic` values are actually present, so adding a new topic slug needs no
app change.

## GitHub Pages interface

`../docs/` is the study interface (`docs/index.html`, `docs/app.js`,
`docs/styles.css`) that GitHub Pages serves. It reads its data from
`docs/data/bank.json` and `docs/data/foundations.json`, which are **copies**
of this folder's `bank.json` and `foundations.json` (GitHub Pages can only
serve files under the configured Pages source folder, so the app can't
fetch `../flashcards/*.json` directly). After editing either file, re-sync
both copies:

```
cp flashcards/bank.json docs/data/bank.json
cp flashcards/foundations.json docs/data/foundations.json
```

Progress (per-card review state) is stored client-side in the browser's
`localStorage`, not in this repo. Card `id`s are namespaced so the two decks
never collide in that store (`foundation-*` vs. `YYYY-MM-DD-am/pm-###`).

## Known limitations

Same caveats as `reference/historical_exams/audit/METHODOLOGY.md`: this is
LLM-driven legal-content analysis, not review by a registered patent
practitioner. Every PARTIALLY_OBSOLETE rewrite should be spot-checked against
the original question and the current MPEP text before being relied upon,
and STILL_VALID cards carry the same residual risk as the underlying audit
determination. The same caveat applies to `foundations.json`: every citation
was checked against the locally pinned MPEP/CFR/USC text at drafting time,
but this is still LLM-drafted content, not reviewed by a registered patent
practitioner.
