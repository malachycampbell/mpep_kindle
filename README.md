# MPEP Kindle / Patent Bar Study Tools

A personal study-tools repository for the USPTO Registration Examination ("Patent Bar"), built on top of an MPEP-to-Kindle conversion pipeline.

## What's here

- **MPEP Kindle pipeline** (original purpose) -- `pdfs/`, `mpep_build/`, `build_mpep_epub.sh` convert the official MPEP chapter PDFs into a single `MPEP.epub` for offline reading. `MPEP_combined.pdf` is the same source material as one file.
- **Draft study guides** -- `markdown_chapter_summaries/` and `MPEP_Patent_Bar_Study_Materials/` are earlier, lighter-verification drafts (see notes below). They are **not** treated as authoritative sources for the audited study modules being built.
- **`reference/`** -- the audited source library for the study-tool project: exam-defining materials (MPEP, Trial Practice Guide, professional-conduct rules, PPH notice), supporting/validation materials (35 U.S.C., 37 CFR), and administrative references (General Requirements Bulletin, Prometric tutorial). See `reference/exam_source_manifest/manifest.json` for full provenance/version/checksum metadata on every source.
- **`reference/historical_exams/`** -- the 3 USPTO registration-exam sessions ever officially released (Oct 2002, Apr 2003, Oct 2003; recovered via the Wayback Machine, since USPTO's original hosting is gone), plus `extract.py` and its structured JSON output in `extracted/`. These predate the AIA and current MPEP, so content here is **not** assumed current law until audited -- see `audit/METHODOLOGY.md` and `audit/2002-10-16_audit.json` / `audit/2003-04-15_audit.json` / `audit/2003-10-15_audit.json` (all 3 of 3 sessions audited).
- **`flashcards/`** -- two decks. `bank.json` is the Phase 3 flashcard bank promoted from the audited historical exams (238 cards, the **advanced/assessment layer** -- STILL_VALID questions as-is, PARTIALLY_OBSOLETE questions rewritten to current citations/terminology), with `skipped.json` documenting exclusions. `foundations.json` is the Phase 7 **beginner vocabulary/concept layer** -- short question/short-answer cards teaching the language and mental model of U.S. patent practice, sourced from 35 U.S.C./37 CFR/MPEP, so the historical bank becomes readable. `README.md` documents both schemas and the promotion/sourcing policy.
- **`docs/`** -- the GitHub Pages study interface: live at https://malachycampbell.github.io/mpep_kindle/. Mobile-first, with a **Deck** selector (Foundations vs. Historical Exam Bank, each with its own filters) and two modes -- self-graded **Flashcards** and auto-graded, optionally-timed **Quiz** -- sharing one Leitner-style spaced-repetition progress store in the browser's `localStorage`. See `docs/README.md` for deck/mode details and the scope decisions behind Quiz mode. Reads `docs/data/bank.json` and `docs/data/foundations.json`, synced copies of the two `flashcards/*.json` files -- see `flashcards/README.md` for the sync step.
- **Flashcard module** -- content and interface (both decks, both study modes) built and live (Phase 3-5 and 7 -- see project status). **No practice-exam-format mock or new question-generation pipeline** for the historical bank -- see `docs/README.md`'s "Scope decisions".

## Project status

This repo is being extended with two GitHub Pages study modules: a mobile flashcard system and a Patent Bar practice-exam system, built incrementally and audited against official USPTO source materials rather than general knowledge.

| Phase | Status |
|---|---|
| 0 -- Repository inspection & architecture | Done |
| 1 -- Source-library acquisition (`reference/`) | Done |
| 2 -- Historical exam extraction & current-law audit | Extraction done; audit complete (3 of 3 sessions) |
| 3 -- Flashcard bank & GitHub Pages interface | Done -- 238 cards in `flashcards/bank.json`; interface live on GitHub Pages |
| 4/5 -- Practice-exam mode (scoped down, see `docs/README.md`) | Done -- Quiz mode added to the same interface (auto-graded, optional timer), reusing the existing 238-card bank; no new question-generation pipeline or strict 100-question mock exam simulation, by deliberate scope choice |
| 6 -- Iteration | Not started |
| 7 -- Foundations deck (beginner vocabulary/concept layer, `flashcards/foundations.json`) | In progress -- schema, app integration (Deck selector, `qa`-card rendering, Source/details disclosure, per-deck stats), and Topic 1 ("System & Legal Vocabulary", 22 cards) done; checkpoint with user before drafting the remaining ~8 topics toward the ~200-card target |

## A note on content accuracy

`markdown_chapter_summaries/` and most of `MPEP_Patent_Bar_Study_Materials/` were generated with lighter verification than the flashcard/exam modules require (see `MPEP_Patent_Bar_Study_Materials/mpep-static-pdf-build-spec.md` for exactly what was and wasn't independently checked against the MPEP text). Audited study content is derived directly from `pdfs/` (the actual MPEP text) and the other sources catalogued in `reference/exam_source_manifest/manifest.json`, not from these earlier drafts.

## Development environment

This repo uses a conda environment (`environment.yml`) so the same tool versions (Python, `pandoc`, `poppler`) are available whether you're working locally or in a GitHub Codespace -- no more relying on `apt-get` inside the build script.

**Locally (macOS):**

```
brew install miniforge   # one-time
conda env create -f environment.yml
conda activate mpep-kindle
```

**In a Codespace:** open this repo in GitHub Codespaces and the container builds automatically from `.devcontainer/`. It creates the `mpep-kindle` conda env from the same `environment.yml` and installs the Claude Code CLI. On first use in a new Codespace, run `claude` and follow the printed link to log in -- authentication is per-machine, so a fresh Codespace needs its own login even though your local machine is already signed in.

Because both environments are built from the same `environment.yml`, adding a dependency in one place (edit the file, `conda env update -f environment.yml`, commit) keeps local and Codespaces in sync.

## Building the EPUB

```
./build_mpep_epub.sh
```

Requires `poppler-utils` and `pandoc`. Converts `pdfs/*.pdf` -> `mpep_build/` -> `MPEP.epub`.
