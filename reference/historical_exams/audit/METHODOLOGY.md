# Current-law audit methodology

This documents the process used to audit historical exam questions against
current law (MPEP Ninth Edition, Revision 01.2024, and the current U.S.
Code/C.F.R.), per the caveat in `reference/historical_exams/manifest.json`.
It began as a pilot pass covering only the **2002-10-16** session (100
questions; see `reference/historical_exams/audit/2002-10-16_audit.json`), was
applied to the **2003-04-15** session next (100 questions; see
`reference/historical_exams/audit/2003-04-15_audit.json`), and has now been
applied to the third and final session, **2003-10-15** (100 questions; see
`reference/historical_exams/audit/2003-10-15_audit.json`). All 3 of 3
historical exam sessions (300 questions total) have been audited.

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

In addition to the above, the 2003-10-15 pass identified further recurring
drift patterns worth watching for in any future re-audit:
  - Pre-AIA 35 U.S.C. 102(e) and 102(g) are now labeled "Pre-AIA" throughout
    the current MPEP; the AIA analogs are 102(a)(2) (for 102(e)-type patent/
    published-application prior art) and the elimination of any first-to-
    invent "reduction to practice by another" rejection basis (for
    102(g)-type rejections, which have no AIA equivalent at all).
  - 37 CFR 1.131 antedating declarations (and the associated "swearing
    behind" case law) apply only to applications examined under the pre-AIA
    first-to-invent system. AIA-governed applications use 37 CFR 1.130
    declarations instead, for the narrower purpose of disqualifying certain
    prior disclosures or joint-research/common-ownership art -- not to
    prove an earlier invention date generally.
  - 37 CFR 1.99 (third-party submissions in a pending application) is now
    "[Reserved]"; it was replaced by 37 CFR 1.290 (preissuance submissions),
    which has different timing and content requirements.
  - 37 CFR 1.601 was entirely repurposed by the AIA: the pre-AIA version
    defined interference practice (including the "same patentable
    invention" test at 1.601(n)); the current version opens the
    supplemental-examination rules (35 U.S.C. 257) instead -- a wholly
    unrelated AIA-created proceeding.
  - Appeal-to-the-Board procedure was relocated from 37 CFR 1.191-1.197 to
    37 CFR Part 41 (e.g., notice of appeal now 37 CFR 41.31, examiner's
    answer content now 41.39, grouping of claims now 41.37(c)(1)(iv)),
    effective 2004, independent of the BPAI->PTAB renaming of the tribunal
    itself.
  - 35 U.S.C. 112's paragraph numbering was replaced by lettered subsections
    by the Sept. 16, 2012 AIA technical amendments: "first paragraph" ->
    112(a), "second paragraph" -> 112(b), "fourth paragraph" -> 112(d),
    "sixth paragraph" (means/step-plus-function) -> 112(f). This is
    pervasive and was noted for 112(a)/(b) in the 2003-04-15 pass; the
    2003-10-15 pass additionally found it for 112(d) and 112(f).
  - The claim requirement for a nonprovisional application's filing date
    under 37 CFR 1.53(b) was removed effective Dec. 18, 2013 -- a claim is
    no longer necessary to receive a filing date, only a specification (and
    drawings if applicable).
  - The AIA's amendment of 35 U.S.C. 115 (effective Sept. 16, 2012)
    eliminated citizenship as a required element of the inventor's oath/
    declaration; current inventor data is limited to name, residence, and
    mailing address. Any question turning on an oath/ADS citizenship
    discrepancy is now obsolete.
  - The domestic-only "in this country" limitation eliminated by the AIA is
    broader than previously catalogued: it applies not only to the public-
    use/on-sale bar but to prior "knowledge or use" under old 102(a)
    generally. Current 35 U.S.C. 102(a)(1) has no geographic limitation for
    any category of prior art.
  - The PCT's contracting-state designation requirement was eliminated
    effective Jan. 1, 2004: filing an international application now
    automatically designates all Contracting States, so a failure-to-
    designate defect (and the associated Invitation to Correct) can no
    longer occur.
  - The pre-Bilski/Alice "Safe Harbors" computer-related-invention
    eligibility framework (former MPEP § 2106(IV)(B), built on State Street
    Bank and AT&T v. Excel Communications' "useful, concrete, and tangible
    result" test) was abrogated by Bilski v. Kappos (2010) and Alice Corp.
    v. CLS Bank (2014); current MPEP § 2106 applies the Alice/Mayo two-step
    framework instead.
  - The small-entity fee discount was raised from 50% to 60% for most fees
    effective Dec. 29, 2022 (Unleashing American Innovators Act), and a
    micro-entity category (75% discount, 35 U.S.C. 123) did not exist at
    all in 2002-2003. Any question hardcoding "50 percent" as the small-
    entity discount is now stale as to that figure, even where its
    categorization of which fees qualify remains correct.
  - MPEP chapter 200 was substantially reorganized (content on benefit
    claims, e.g. CIP filing-date entitlement, moved from the 201.xx series
    into a new 211.xx series), so some pre-reorganization MPEP citations no
    longer exist at their old numbers even though the underlying doctrine
    is unchanged.

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
- All three sessions have now been audited (2002-10-16, 2003-04-15,
  2003-10-15; 300 of 300 total historical-exam questions). No historical
  exam sessions remain unaudited.

## Next steps

With all three sessions audited (2002-10-16: 56/24/20;
2003-04-15: 51/33/16; 2003-10-15: 54/26/20 for
STILL_VALID/PARTIALLY_OBSOLETE/OBSOLETE respectively -- 161 STILL_VALID, 83
PARTIALLY_OBSOLETE, 56 OBSOLETE out of 300 total), the next phase is to
decide, session by session, whether STILL_VALID/PARTIALLY_OBSOLETE questions
get promoted into the Phase 3 flashcard bank (with PARTIALLY_OBSOLETE
questions rewritten to current citations/terminology first) and whether
OBSOLETE questions are excluded outright or rewritten from scratch under
current law.
