# Current-law audit methodology

This documents the process used to audit historical exam questions against
current law (MPEP Ninth Edition, Revision 01.2024, and the current U.S.
Code/C.F.R.), per the caveat in `reference/historical_exams/manifest.json`.
It is a pilot pass covering only the **2002-10-16** session (100 questions);
see `reference/historical_exams/audit/2002-10-16_audit.json` for the results.

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
- **NOT_APPLICABLE** -- reserved for questions on a topic removed from the
  tested syllabus entirely (not used in this pass; no question in the
  2002-10-16 session met this bar outright, though several OBSOLETE
  questions come close).

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

## Known limitations of this pilot

- This is legal-content analysis by an LLM, not by a registered patent
  practitioner. Every OBSOLETE/PARTIALLY_OBSOLETE determination should be
  spot-checked before being relied upon for exam-prep content, and every
  STILL_VALID determination carries residual risk that a doctrinal shift
  was missed (the same way the automated triage missed KSR/Williamson/etc.
  until manual review caught them).
- A handful of "STILL_VALID" and "PARTIALLY_OBSOLETE" notes flag specific
  citation numbers or dollar thresholds as needing a light verification
  pass (e.g. the $25 fee-refund de minimis threshold in 37 CFR 1.26); these
  were not individually re-verified against current rule text in this pass.
- This pass covers only 2002-10-16 (100 of 300 total historical-exam
  questions). The 2003-04-15 and 2003-10-15 sessions have not yet been
  audited.

## Next steps

Apply the same full-manual-read methodology to the remaining two sessions
(2003-04-15, 2003-10-15), then decide, session by session, whether
STILL_VALID/PARTIALLY_OBSOLETE questions get promoted into the Phase 3
flashcard bank (with PARTIALLY_OBSOLETE questions rewritten to current
citations/terminology first) and whether OBSOLETE questions are excluded
outright or rewritten from scratch under current law.
