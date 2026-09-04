# Current-law audit methodology

This documents the process used to audit historical exam questions against
current law (MPEP Ninth Edition, Revision 01.2024, and the current U.S.
Code/C.F.R.), per the caveat in `reference/historical_exams/manifest.json`.
It began as a pilot pass covering only the **2002-10-16** session (100
questions; see `reference/historical_exams/audit/2002-10-16_audit.json`) and
has since been applied to the **2003-04-15** session as well (100 questions;
see `reference/historical_exams/audit/2003-04-15_audit.json`). One session,
**2003-10-15**, remains unaudited.

## Status values

Each question is assigned one of four statuses:

- **STILL_VALID** -- the tested doctrine and its citations are unchanged
  under current law. Usable as-is for flashcard/practice-exam content.
- **PARTIALLY_OBSOLETE** -- the underlying doctrine survives, but something
  about the question needs updating before reuse: a citation was renumbered
  or relocated (e.g. pre-AIA "35 U.S.C. 112, first paragraph" -> current
  "35 U.S.C. 112(a)"), a named tribunal/rule was renamed (e.g. "Board of
  Patent Appeals and Interferences" -> "Patent Trial and Appeal Board"), or
  a fact pattern relies on a practice (e.g. CD-ROM sequence-listing
  submission) that has since been superseded by a procedural change that
  doesn't change the tested legal principle.
- **OBSOLETE** -- the tested legal framework itself no longer applies to
  applications examined today (overwhelmingly: applications subject to the
  America Invents Act, i.e. essentially all applications in 2026). Not
  usable without a substantial rewrite. Common causes found in this pass:
  - Pre-AIA first-to-invent priority contests (37 CFR 1.131 "swearing
    behind," conception/reduction-to-practice/diligence, "date of
    invention" under 35 U.S.C. 104).
  - Pre-AIA 35 U.S.C. 102(a)/(b)/(d)/(e) statutory-bar/prior-art structure,
    replaced by AIA 102(a)(1)/(a)(2)/(b).
  - Rules eliminated or substantially rewritten by the AIA: 37 CFR 1.47
    (nonsigning-inventor petitions, replaced by 37 CFR 1.64 substitute
    statements), 37 CFR 1.48 (inventorship correction, deceptive-intent
    requirement removed), 35 U.S.C. 115 (inventor's oath content), 37 CFR
    1.99 (third-party submissions, replaced by 37 CFR 1.290 preissuance
    submissions).
  - Continued Prosecution Application (CPA) practice for utility/plant
    applications, eliminated in July 2003 (shortly after this exam).
  - The removal of the domestic-only geographic limitation on the
    public-use/on-sale bar (AIA 102(a)(1) has no "in this country"
    limitation, unlike pre-AIA 102(b)).
  - Pre-KSR rigid teaching-suggestion-motivation (TSM) obviousness doctrine,
    superseded by KSR v. Teleflex (2007).
  - Superseded physical-filing practices (USPS "Express Mail" certificate
    procedure, CD-ROM sequence-listing submission) now handled through
    USPTO electronic filing (EFS-Web/Patent Center).
  - Statutory Invention Registration (SIR), eliminated when pre-AIA 35
    U.S.C. 157 was repealed (effective March 2013).
  - Pre-AIA interference practice under 37 CFR 1.601 et seq. (senior/junior
    party by filing date, common-ownership rule for declaring
    interferences), now residual/pre-AIA-transitional only, replaced
    generally by AIA derivation proceedings.
  - The removal of the claim requirement for according a nonprovisional
    utility application a filing date (37 CFR 1.53(b)), effective Dec 18,
    2013 AIA technical amendments.
  - The design patent term change from 14 to 15 years from grant (Patent
    Law Treaties Implementation Act, effective May 13, 2015).
- **NOT_APPLICABLE** -- reserved for questions on a topic removed from the
  tested syllabus entirely (not used in either pass so far, though several
  OBSOLETE questions come close).

In addition to the OBSOLETE causes above, the 2003-04-15 pass identified
several recurring PARTIALLY_OBSOLETE citation/terminology drifts worth
watching for in future sessions:
  - "Board of Patent Appeals and Interferences" renamed the "Patent Trial
    and Appeal Board" (PTAB) by the AIA, with associated appeal-rule
    citations (formerly 37 CFR 1.191-1.197) relocated to 37 CFR Part 41.
  - 37 CFR Part 10 (Code of Professional Responsibility) replaced by Part
    11 (USPTO Rules of Professional Conduct), effective May 3, 2013 --
    every "37 CFR 10.xx" ethics citation is stale.
  - Pre-AIA "35 U.S.C. 112, first/second paragraph" (and "112, 6th
    paragraph") citations, now 112(a)/112(b)/112(f) respectively -- this is
    pervasive across questions testing enablement, definiteness, written
    description, and means-plus-function doctrine.
  - 37 CFR 1.137's former (a) unintentional/(b) unavoidable split was
    unified into a single "unintentional" standard (effective Dec 18,
    2013); the parallel "unavoidable" delayed-issue-fee-payment provision
    (former 37 CFR 1.317) was likewise folded into 37 CFR 1.137(c) and is
    now "[Reserved]".
  - The USPTO's PAIR system was retired and replaced by Patent Center
    (November 2022).
  - MPEP § 2106.02 was repurposed for the post-Alice/Mayo patent-eligibility
    framework (Chapter 2106 rewritten starting 2014) and is now
    "[Reserved]" in its old (enablement-rebuttal-evidence) role -- a citation
    can go stale even where the underlying doctrine survives elsewhere in
    the current MPEP, simply because the section number was reused for an
    unrelated topic.

## Process

1. **Automated triage.** All current MPEP chapter PDFs (`pdfs/`) were
   converted to text and combined into a searchable corpus. A script
   extracted every "MPEP §" and "37 C.F.R. §" citation from each question's
   rationale and checked whether the cited section number appears anywhere
   in the current corpus, and separately flagged questions whose full text
   matched a list of pre-AIA-era keywords (interference, first-to-invent,
   date of invention, reduction to practice, conception, diligence, swear
   behind, Board of Patent Appeals and Interferences, CPA, 102(g), etc.).
2. **Full manual read-through.** The triage caught real issues but also
   produced false positives (e.g. "CCPA" case citations tripping the "CPA"
   keyword) and, more importantly, missed doctrinal shifts that don't
   correlate with any AIA-era keyword at all -- KSR, Williamson v. Citrix
   (means-plus-function), Nautilus v. Biosig (definiteness standard),
   Therasense (inequitable conduct materiality), the elimination of 37 CFR
   1.47/1.48/1.99/115 by the AIA, and the Express Mail / CD-ROM procedural
   supersessions. **Every one of the 100 questions in this pilot was
   individually read and assessed against current law and current MPEP
   organization**, not just the ones the automated triage flagged. The
   triage is retained as a first-pass aid for future sessions, but it is
   not a substitute for the manual read.
3. Each assessment cites the specific rule, statute, or case responsible
   for a status determination, so a future pass can verify or challenge it
   without re-deriving the analysis from scratch.
4. **Local corpus verification (added for the 2003-04-15 pass).** For
   specific, checkable factual claims about current rule text (e.g. whether
   a CFR subsection still exists, whether a rule was renumbered, whether a
   claim is still required for a filing date), the current MPEP text
   corpus already extracted into `mpep_build/*.txt` was grepped directly
   rather than relying solely on model recall. This caught several
   citation-drift issues (e.g. 37 CFR 1.317 now "[Reserved]", MPEP §
   2106.02 repurposed, 37 CFR Part 10 renumbered to Part 11) that would
   otherwise have been easy to miss or get wrong. Recommended for future
   passes whenever a determination hinges on a specific current-rule
   detail rather than general legal-framework knowledge.

## Known limitations

- This is legal-content analysis by an LLM, not by a registered patent
  practitioner. Every OBSOLETE/PARTIALLY_OBSOLETE determination should be
  spot-checked before being relied upon for exam-prep content, and every
  STILL_VALID determination carries residual risk that a doctrinal shift
  was missed (the same way the automated triage missed KSR/Williamson/etc.
  until manual review caught them).
- A handful of "STILL_VALID" and "PARTIALLY_OBSOLETE" notes flag specific
  citation numbers or dollar thresholds as needing a light verification
  pass (e.g. the $25 fee-refund de minimis threshold in 37 CFR 1.26); these
  were not individually re-verified against current rule text in either
  pass so far.
- Two of three sessions have been audited (2002-10-16, 2003-04-15; 200 of
  300 total historical-exam questions). The 2003-10-15 session has not yet
  been audited.

## Next steps

Apply the same full-manual-read methodology (with local-corpus
verification, per step 4 above) to the remaining session (2003-10-15),
then decide, session by session, whether
STILL_VALID/PARTIALLY_OBSOLETE questions get promoted into the Phase 3
flashcard bank (with PARTIALLY_OBSOLETE questions rewritten to current
citations/terminology first) and whether OBSOLETE questions are excluded
outright or rewritten from scratch under current law.
