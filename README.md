# MPEP Kindle / Patent Bar Study Tools

A personal study-tools repository for the USPTO Registration Examination ("Patent Bar"), built on top of an MPEP-to-Kindle conversion pipeline.

## What's here

- **MPEP Kindle pipeline** (original purpose) -- `pdfs/`, `mpep_build/`, `build_mpep_epub.sh` convert the official MPEP chapter PDFs into a single `MPEP.epub` for offline reading. `MPEP_combined.pdf` is the same source material as one file.
- **Draft study guides** -- `markdown_chapter_summaries/` and `MPEP_Patent_Bar_Study_Materials/` are earlier, lighter-verification drafts (see notes below). They are **not** treated as authoritative sources for the audited study modules being built.
- **`reference/`** -- the audited source library for the study-tool project: exam-defining materials (MPEP, Trial Practice Guide, professional-conduct rules, PPH notice), supporting/validation materials (35 U.S.C., 37 CFR), and administrative references (General Requirements Bulletin, Prometric tutorial). See `reference/exam_source_manifest/manifest.json` for full provenance/version/checksum metadata on every source.
- **`reference/historical_exams/`** -- the 3 USPTO registration-exam sessions ever officially released (Oct 2002, Apr 2003, Oct 2003; recovered via the Wayback Machine, since USPTO's original hosting is gone), plus `extract.py` and its structured JSON output in `extracted/`. These predate the AIA and current MPEP, so content here is **not** assumed current law until audited -- see `audit/METHODOLOGY.md` and `audit/2002-10-16_audit.json` (1 of 3 sessions audited so far).
- **Flashcard and practice-exam modules** -- in progress. See project status below.

## Project status

This repo is being extended with two GitHub Pages study modules: a mobile flashcard system and a Patent Bar practice-exam system, built incrementally and audited against official USPTO source materials rather than general knowledge.

| Phase | Status |
|---|---|
| 0 -- Repository inspection & architecture | Done |
| 1 -- Source-library acquisition (`reference/`) | Done |
| 2 -- Historical exam extraction & current-law audit | Extraction done; audit in progress (1 of 3 sessions) |
| 3 -- Flashcard bank & GitHub Pages interface | Not started |
| 4 -- Practice-exam architecture design | Not started |
| 5 -- Practice-exam generator & interface | Not started |
| 6 -- Iteration | Not started |

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
