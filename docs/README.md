# GitHub Pages study interface

Static app (`index.html` / `app.js` / `styles.css`, no build step or framework)
served by GitHub Pages from this folder. Reads `data/bank.json` and
`data/foundations.json`, synced copies of `flashcards/bank.json` and
`flashcards/foundations.json` -- see `../flashcards/README.md` for the sync
step and both card schemas.

## Decks

The setup screen's **Deck** selector picks which card pool you're studying
from -- the two decks have different schemas and different filters, and a
card's `id` namespace keeps their spaced-repetition progress from colliding
in the same `localStorage` store:

- **Foundations** -- short vocabulary/concept cards (`flashcards/foundations.json`),
  the beginner-facing layer teaching the language and mental model of U.S.
  patent practice before the historical questions are readable. Filterable
  by topic and level (Vocabulary / Concepts / Practice); the topic list is
  generated from whatever topics actually exist in the data, not hardcoded.
  The Practice level (level 2, bridge multiple-choice cards) has no content
  yet, so its checkbox is disabled and marked "coming soon" rather than
  offered as a selectable option that would just match zero cards.
- **Historical Exam Bank** -- the original 238-card audited-Patent-Bar-question
  deck (`flashcards/bank.json`), unchanged from Phase 3. Filterable by exam
  session/part/current-law status, same as before.

Every card, in either deck, can carry a "Source / details" disclosure under
the answer with its citations (`sources[]` on Foundations cards; historical
cards don't yet carry this but could be retrofitted from their `audit_ref`).

## Modes

Both modes share the same deck-specific filters (see Decks, above), the
same progress/deck-size/shuffle controls, and the same per-card progress
store (a Leitner-style 4-box spaced-repetition schedule in `localStorage`,
box intervals 0/1/3/7 days). They differ only in how you interact with a
card:

- **Flashcards** -- self-graded. Tap to reveal the answer and explanation,
  then judge yourself ("Missed it" / "Got it"). No pressure to actually
  commit to an answer first. Works for both `qa` cards (Foundations) and
  `mcq` cards (either deck).
- **Quiz** -- auto-graded. You pick a choice and submit; correctness is
  determined by comparing your pick to `card.answer`, not self-reported.
  Feeds the identical Leitner progress as flashcard grading (a correct pick
  = "good", incorrect = "again"), so both modes contribute to the same
  mastery stats. Optional countdown timer (10/20/30/45/60 min, or none); on
  timeout the session ends immediately and any unanswered questions count
  against the score, mirroring how the real exam scores blanks. Only
  `mcq`-type cards are eligible for Quiz mode -- free-recall `qa` cards
  aren't multiple-choice, so picking Quiz mode with the Foundations deck
  only matches its (currently few-to-none) `mcq` cards, by design.

## Scope decisions (2026-09-08)

This is Phase 4/5 combined from the root `README.md` roadmap, deliberately
scoped down from the original plan:

- **No new question-generation pipeline.** Quiz mode draws only from the
  existing 238-card audited bank (`flashcards/bank.json`) -- it does not
  attempt to synthesize new current-law questions from the MPEP text. A
  full-length exam therefore can't be filled without repetition; that's a
  known, accepted limitation, not a bug.
- **No strict full-length mock-exam simulation.** The real USPTO exam is
  100 questions across two 3-hour timed sessions (see
  `reference/general_requirements/general_requirements_bulletin.pdf`,
  section B) -- this interface does not attempt to reproduce that exact
  structure. Quiz mode is a flexible, configurable scored quiz instead
  (any filter combination, any deck size via the existing size cap, any
  timer length or none).

If a bigger question pool or a strict exam-format mode is wanted later,
that's a new scoping decision, not an extension of the current build.
