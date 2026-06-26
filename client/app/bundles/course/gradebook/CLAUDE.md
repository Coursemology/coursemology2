# Gradebook — Terminology conventions

### "Grade" vs "Score" vs "Assessment"

- **grade** — canonical term. Use in code, API keys, i18n, UI.
  - DB columns: `grade` (on answers), `maximum_grade` (on questions)
  - Feature = **Gradebook** (book of *grades*)
- **score** — avoid. Informal synonym, no DB grounding. No new "score" terms.
- **assessment** — the *entity* (quiz, mission, tutorial). Use when referring to things selected/listed, not grade values inside.

**Practical rules:**
- Empty state when no assessment columns chosen → "No assessments selected" (user selects *assessments*, not grades/scores)
- Export tree column group with per-assessment grade columns → **"Grades"** (data category, parallel to "Student info" / "Gamification")
- Never label that group "Scores"

---

## External floor/cap: read-time, weighted-view-only (load-bearing invariant)

`floorAtZero` / `capAtMaximum` on an external assessment are applied **only** in
`effectiveGrade()` (`computeWeighted.ts`), which runs **only** for the
Weighted-total view. Consequences any change here must preserve:

- **Stored grades are never mutated.** Toggling cap does NOT rewrite a 105 to 100;
  it only clamps that assessment's *contribution* to the weighted total. The raw
  "All assessments" view and its CSV export always show the literal stored value.
- **No effect when the weighted view is off.** With weighting off the toggles are
  inert. Any UI that names a consequence ("capped in the weighted total") must be
  conditional on `weightedViewEnabled` (e.g. `GradebookTable`'s over-max tooltip,
  the import Verify warning).
- **Out-of-range signals are three independent layers:** per-cell icons in
  `GradebookTable` (locate), the import Verify warning (entry-time), and
  `OutOfRangeAlert` above the table (aggregate, pre-export). They share the
  read-time contract — none of them change data.
- **Negatives are valid input** (penalty/deduction columns). Both the manual cell
  (regex allows a leading `-`) and CSV import accept them; `floorAtZero` is what
  neutralises them in the total.

Design rationale and the per-question decisions live in
`tmp/pr-notes/feat-ext-assessments.md` (D9–D12).

---

## Server-controlled (non-pickable) table columns — never use `defaultVisible`

`GradebookWeightedTable`'s level columns (`Level`, `Level Contribution`) are driven by
course settings (`enabled`/`show`), not the column picker. For columns like these:

- **Gate column *presence* on the setting** (push the column into the array only when on),
  and add the id to the table's `columnPicker.locked` so it is force-visible.
- **Do NOT plumb the setting through `ColumnTemplate.defaultVisible`.** `defaultVisible` is a
  one-time seed in `useTanStackTableBuilder` that loses to persisted `localStorage`
  (`initialVisibility` prefers stored over default) and to the reconcile effect's
  `prev[id]` preservation. Once persisted hidden, the setting can never re-reveal it — and a
  non-pickable column has no picker fallback, so it is stranded.
- `GradebookWeightedTable` renders header rows **and** body rows **by hand** (not from the
  `columns` array). Adding/reordering a column means editing 4 sites in lockstep: the
  `columns` array, header row 1, header row 3 (subheader), the body `<TableRow>`, and the
  expanded-breakdown row. Column-array order alone is not enough.

---

## Gradebook overhaul — implementation index (in progress)

Beyond the weighted-view work, the gradebook is being extended via **3 initiatives**. Full
design + per-PR plans live in `docs/superpowers/specs/` (local only — gitignored, like this
file). **Before writing any overhaul code, read the relevant specs below for the PR you're on.**

**Start here:** `docs/superpowers/specs/2026-06-10-gradebook-overhaul-SUMMARY.md` (conclusions +
global PR sequence). `…-overhaul-DETAILED.md` has the reasoning + a current-state code map
(file:line) of the gradebook/grading internals.

Build in this order. For each PR, read that initiative's **design** (relevant section) + the
matching **PR section** of its **implementation-plan**, then run `writing-plans` for a
task-level plan:

1. **External Assessments** — keystone; makes the weighted total true.
   - design: `specs/2026-06-10-gradebook-external-assessments-design.md`
   - plan: `specs/2026-06-10-gradebook-external-assessments-implementation-plan.md` — PR1 BE foundation → PR2 FE manual usage → PR3 CSV import
   - decisions: `research-notes/2026-06-10-external-assessments-design-decisions.md`
   - ⚠ OPEN before PR1: edit-permission (split vs manager-only) — see design "Authorization".

2. **Student Gradebook + Verification** — needs (1) for externals to appear; else parallel.
   - design: `specs/2026-06-10-gradebook-student-view-and-verification-design.md`
   - plan: `specs/2026-06-10-gradebook-student-view-and-verification-implementation-plan.md` — PR1 BE read+publish → PR2 FE view+publish → PR3 verification
   - decisions: `research-notes/2026-06-10-student-gradebook-verification-design-decisions.md`

3. **Grade Audit History** — external-capture hook needs (1) merged.
   - design: `specs/2026-06-10-gradebook-grade-audit-history-design.md`
   - plan: `specs/2026-06-10-gradebook-grade-audit-history-implementation-plan.md` — PR1 BE capture+API → PR2 FE history view → (opt) per-submission panel
   - decisions: `research-notes/2026-06-10-grade-audit-history-design-decisions.md`

Roadmap context also in memory: `project_gradebook_overhaul`. Paths above are relative to the
repo root; **in a worktree** the specs exist only in the main repo — read them from
`../coursemology2/docs/superpowers/...`.
