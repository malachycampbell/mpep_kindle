# GitHub Pages study interface

Static app (`index.html` / `app.js` / `styles.css`, no build step or framework)
served by GitHub Pages from this folder. Reads `data/bank.json`, a synced copy
of `flashcards/bank.json` -- see `../flashcards/README.md` for the sync step
and card schema.

## Modes

Both modes share the same setup-screen filters (session, part, current-law
status, progress, deck size, shuffle) and the same per-card progress store
(a Leitner-style 4-box spaced-repetition schedule in `localStorage`, box
intervals 0/1/3/7 days). They differ only in how you interact with a card:

- **Flashcards** -- self-graded. Tap to reveal the answer and explanation,
  then judge yourself ("Missed it" / "Got it"). No pressure to actually
  commit to an answer first.
- **Quiz** -- auto-graded. You pick a choice and submit; correctness is
  determined by comparing your pick to `card.answer`, not self-reported.
  Feeds the identical Leitner progress as flashcard grading (a correct pick
  = "good", incorrect = "again"), so both modes contribute to the same
  mastery stats. Optional countdown timer (10/20/30/45/60 min, or none); on
  timeout the session ends immediately and any unanswered questions count
  against the score, mirroring how the real exam scores blanks.

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
