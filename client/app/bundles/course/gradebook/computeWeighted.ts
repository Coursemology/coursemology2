// client/app/bundles/course/gradebook/computeWeighted.ts
import {
  AssessmentData,
  LevelContributionData,
  StudentData,
  SubmissionData,
  TabData,
} from 'types/course/gradebook';

import { ParsedFormula } from './levelFormula';

type GradeEntry = Pick<SubmissionData, 'studentId' | 'assessmentId' | 'grade'>;

// Synthetic ids for the Level term — disjoint from real (positive) tab/assessment ids.
export const LEVEL_TAB_ID = -1;
export const LEVEL_ASSESSMENT_ID = -1;

export interface WeightedRow {
  studentId: number;
  name: string;
  email: string;
  externalId: string | null;
  subtotals: (number | null)[];
  level: number;
  levelContribution: number | null;
  total: number | null;
}

export interface AssessmentContribution {
  assessmentId: number;
  title: string;
  grade: number | null;
  maxGrade: number;
  points: number; // contribution to this tab's weighted-points cell
  // Share of the overall grade this assessment carries, in percentage points.
  // Equal mode: the tab's weight split evenly across its assessments.
  // Custom mode: the assessment's own configured weight.
  effectiveWeight: number;
  excluded: boolean;
  dropped: boolean; // equal-mode keep-highest: ranked out for this student
}

export interface TabBreakdown {
  tabId: number;
  assessments: AssessmentContribution[];
}

type GradeLookup = Map<string, number>;

const gradeKey = (studentId: number, assessmentId: number): string =>
  `${studentId}:${assessmentId}`;

// Fraction earned on an assessment. A maxGrade of 0 (e.g. an ungraded 0-point
// assignment) would make grade/maxGrade an NaN; coerce that to 0 so it never
// poisons subtotals, totals or the breakdown.
export const gradeRatio = (grade: number, maxGrade: number): number =>
  maxGrade === 0 ? 0 : grade / maxGrade;

// Index submissions by (student, assessment) once: O(submissions).
const buildGradeLookup = (submissions: GradeEntry[]): GradeLookup => {
  const lookup: GradeLookup = new Map();
  submissions.forEach((s) => {
    if (s.grade != null)
      lookup.set(gradeKey(s.studentId, s.assessmentId), s.grade);
  });
  return lookup;
};

// Group assessments by tab once: O(assessments).
const buildAssessmentsByTab = (
  assessments: AssessmentData[],
): Map<number, AssessmentData[]> => {
  const byTab = new Map<number, AssessmentData[]>();
  assessments.forEach((a) => {
    const list = byTab.get(a.tabId);
    if (list) list.push(a);
    else byTab.set(a.tabId, [a]);
  });
  return byTab;
};

// Equal-weight formula: average of (grade/maxGrade) ratios over INCLUDED assessments.
// Excluded assessments are dropped from both numerator and count; ungraded included
// contribute 0. When keepN > 0, only the top keepN ratios are averaged.
// Returns null when no assessment is included.
const equalSubtotal = (
  studentId: number,
  tab: TabData,
  tabAssessments: AssessmentData[],
  gradeLookup: GradeLookup,
): number | null => {
  const included = tabAssessments.filter((a) => !a.gradebookExcluded);
  if (included.length === 0) return null;
  const keepN = tab.keepHighest ?? 0;
  const ratios = included.map((a) => {
    const grade = gradeLookup.get(gradeKey(studentId, a.id));
    return grade != null ? gradeRatio(grade, a.maxGrade) : 0;
  });
  ratios.sort((x, y) => x - y); // ascending
  const keep = keepN > 0 ? Math.min(keepN, included.length) : included.length;
  const kept = ratios.slice(included.length - keep); // the `keep` highest
  return kept.reduce((acc, r) => acc + r, 0) / kept.length;
};

// Custom-weight formula: Σ(grade_i/maxGrade_i × assessmentWeight_i) / tabWeight over
// INCLUDED assessments. Returns null if tabWeight=0 or no assessment is included;
// ungraded included assessments contribute 0.
const customSubtotal = (
  studentId: number,
  tab: TabData,
  tabAssessments: AssessmentData[],
  gradeLookup: GradeLookup,
): number | null => {
  const tabWeight = tab.gradebookWeight ?? 0;
  if (tabWeight === 0) return null;
  let numerator = 0;
  let hasContributing = false;
  tabAssessments.forEach((a) => {
    if (a.gradebookExcluded) return;
    const grade = gradeLookup.get(gradeKey(studentId, a.id));
    const assessmentWeight = a.gradebookWeight ?? 0;
    if (grade != null)
      numerator += gradeRatio(grade, a.maxGrade) * assessmentWeight;
    hasContributing = true;
  });
  return hasContributing ? numerator / tabWeight : null;
};

// Single source of truth for the subtotal math, operating on prebuilt indexes.
const subtotalFromLookup = (
  studentId: number,
  tab: TabData,
  tabAssessments: AssessmentData[] | undefined,
  gradeLookup: GradeLookup,
): number | null => {
  if (!tabAssessments || tabAssessments.length === 0) return null;
  if (tab.weightMode === 'custom') {
    return customSubtotal(studentId, tab, tabAssessments, gradeLookup);
  }
  return equalSubtotal(studentId, tab, tabAssessments, gradeLookup);
};

// Weighted, additive total from already-computed subtotals.
const totalFromSubtotals = (
  subtotals: (number | null)[],
  tabs: TabData[],
): number | null => {
  let contributingCount = 0;
  let total = 0;
  subtotals.forEach((sub, i) => {
    if (sub == null) return;
    contributingCount += 1;
    total += (tabs[i].gradebookWeight ?? 0) * sub;
  });
  return contributingCount > 0 ? total : null;
};

// Combine the tab total with the Level term: null only when neither contributes.
const combineTotal = (
  tabTotal: number | null,
  lvl: number | null,
): number | null =>
  tabTotal == null && lvl == null ? null : (tabTotal ?? 0) + (lvl ?? 0);

// True when any student's contribution falls outside [0, weight] (drives the dialog warning).
export const levelOutOfRange = (
  students: { level: number }[],
  cfg: LevelContributionData,
  parsed: ParsedFormula,
): boolean => {
  if (!parsed.ok) return false;
  return students.some((s) => {
    const p = parsed.evaluate(s.level);
    return p < 0 || p > cfg.weight;
  });
};

export interface LevelOffender {
  id: number;
  name: string;
  level: number;
  value: number;
}

export interface LevelOffenders {
  // Below 0, most negative first; above max, highest first — so the dialog can
  // name the worst offenders on each side.
  below: LevelOffender[];
  above: LevelOffender[];
  // Students whose contribution is undefined (divide-by-zero) — value is NaN,
  // so the dialog names them by level, not value.
  unscoreable: LevelOffender[];
}

// Students whose Level contribution falls outside [0, max], split by which bound
// they breach. Empty on both sides when the formula is invalid. Feeds the dialog's
// out-of-range warning, which names the most extreme offenders.
export const levelOffenders = (
  students: { id: number; name: string; level: number }[],
  parsed: ParsedFormula | null,
  max: number,
): LevelOffenders => {
  if (!parsed?.ok) return { below: [], above: [], unscoreable: [] };
  const evaluated = students.map((s) => ({
    id: s.id,
    name: s.name,
    level: s.level,
    value: parsed.evaluate(s.level),
  }));
  return {
    below: evaluated
      .filter((e) => e.value < 0)
      .sort((a, b) => a.value - b.value),
    above: evaluated
      .filter((e) => e.value > max)
      .sort((a, b) => b.value - a.value),
    unscoreable: evaluated
      .filter((e) => Number.isNaN(e.value))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)),
  };
};

interface SubtotalArgs {
  studentId: number;
  tab: TabData;
  assessments: AssessmentData[];
  submissions: GradeEntry[];
}

export const computeTabSubtotal = ({
  studentId,
  tab,
  assessments,
  submissions,
}: SubtotalArgs): number | null =>
  subtotalFromLookup(
    studentId,
    tab,
    assessments.filter((a) => a.tabId === tab.id),
    buildGradeLookup(submissions),
  );

interface TotalArgs {
  studentId: number;
  tabs: TabData[];
  assessments: AssessmentData[];
  submissions: GradeEntry[];
  level?: number;
  levelContribution?: LevelContributionData;
  levelContributionPoints?: number | null;
  // The course's current top level, used only as the Level breakdown row's denominator.
  courseMaxLevel?: number;
}

export const computeStudentTotal = ({
  studentId,
  tabs,
  assessments,
  submissions,
  level,
  levelContributionPoints,
}: TotalArgs): number | null => {
  const gradeLookup = buildGradeLookup(submissions);
  const assessmentsByTab = buildAssessmentsByTab(assessments);
  const subtotals = tabs.map((tab) =>
    subtotalFromLookup(
      studentId,
      tab,
      assessmentsByTab.get(tab.id),
      gradeLookup,
    ),
  );
  const tabTotal = totalFromSubtotals(subtotals, tabs);
  return combineTotal(tabTotal, levelContributionPoints ?? null);
};

export const computeStudentBreakdown = ({
  studentId,
  tabs,
  assessments,
  submissions,
  level,
  levelContribution,
  levelContributionPoints,
  courseMaxLevel,
}: TotalArgs): TabBreakdown[] => {
  const gradeLookup = buildGradeLookup(submissions);
  const assessmentsByTab = buildAssessmentsByTab(assessments);
  const result: TabBreakdown[] = tabs.map((tab) => {
    const list = assessmentsByTab.get(tab.id) ?? [];
    const weight = tab.gradebookWeight ?? 0;
    const included = list.filter((a) => !a.gradebookExcluded);
    const includedCount = included.length;

    let droppedIds = new Set<number>();
    let keptCount = includedCount;
    if (tab.weightMode !== 'custom' && includedCount > 0) {
      const keepN = tab.keepHighest ?? 0;
      keptCount = keepN > 0 ? Math.min(keepN, includedCount) : includedCount;
      if (keptCount < includedCount) {
        const ranked = included
          .map((a) => {
            const grade = gradeLookup.get(gradeKey(studentId, a.id));
            return {
              id: a.id,
              ratio: grade != null && a.maxGrade > 0 ? grade / a.maxGrade : 0,
            };
          })
          .sort((x, y) => x.ratio - y.ratio || x.id - y.id); // ascending: lowest first, tie-break by id
        // Drop the lowest (includedCount − keptCount).
        droppedIds = new Set(
          ranked.slice(0, includedCount - keptCount).map((r) => r.id),
        );
      }
    }

    const contributions = list.map((a) => {
      const excluded = !!a.gradebookExcluded;
      const dropped = droppedIds.has(a.id);
      const grade = gradeLookup.get(gradeKey(studentId, a.id)) ?? null;
      const ratio = grade != null ? gradeRatio(grade, a.maxGrade) : 0;
      let points: number;
      let effectiveWeight: number;
      if (excluded || dropped) {
        points = 0;
        effectiveWeight = 0;
      } else if (tab.weightMode === 'custom') {
        points = ratio * (a.gradebookWeight ?? 0);
        effectiveWeight = a.gradebookWeight ?? 0;
      } else {
        points = keptCount > 0 ? (ratio / keptCount) * weight : 0;
        effectiveWeight = keptCount > 0 ? weight / keptCount : 0;
      }
      return {
        assessmentId: a.id,
        title: a.title,
        grade,
        maxGrade: a.maxGrade,
        points,
        effectiveWeight,
        excluded,
        dropped,
      };
    });
    return { tabId: tab.id, assessments: contributions };
  });

  const lvl = levelContributionPoints ?? null;
  if (levelContribution?.enabled && lvl != null) {
    result.push({
      tabId: LEVEL_TAB_ID,
      assessments: [
        {
          assessmentId: LEVEL_ASSESSMENT_ID,
          title: 'Level',
          grade: level ?? 0,
          maxGrade: courseMaxLevel ?? 0,
          points: lvl,
          effectiveWeight: levelContribution.weight,
          excluded: false,
          dropped: false,
        },
      ],
    });
  }
  return result;
};

interface WeightedRowsArgs {
  students: StudentData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  submissions: GradeEntry[];
  showLevelContribution?: boolean;
}

// Batch entry point used by the table: builds the indexes ONCE and reuses them
// across every student, computing each subtotal a single time.
export const computeWeightedRows = ({
  students,
  tabs,
  assessments,
  submissions,
  showLevelContribution = true,
}: WeightedRowsArgs): WeightedRow[] => {
  const gradeLookup = buildGradeLookup(submissions);
  const assessmentsByTab = buildAssessmentsByTab(assessments);
  return students.map((student) => {
    const subtotals = tabs.map((tab) =>
      subtotalFromLookup(
        student.id,
        tab,
        assessmentsByTab.get(tab.id),
        gradeLookup,
      ),
    );
    const tabTotal = totalFromSubtotals(subtotals, tabs);
    const lvl = showLevelContribution
      ? student.levelContribution ?? null
      : null;
    return {
      studentId: student.id,
      name: student.name,
      email: student.email,
      externalId: student.externalId,
      subtotals,
      level: student.level,
      levelContribution: lvl,
      total: combineTotal(tabTotal, lvl),
    };
  });
};

export const sumWeights = (tabs: TabData[]): number =>
  tabs.reduce((acc, t) => acc + (t.gradebookWeight ?? 0), 0);

// A custom-mode tab is "unbalanced" when its INCLUDED assessment weights no
// longer sum to the tab weight — the exact state ConfigureWeightsPrompt blocks
// at save (isUnbalanced). It becomes reachable when an assessment is deleted
// from the tab outside the dialog: the surviving stored weights fall short, so
// customSubtotal (which divides by the tab weight) makes the tab silently
// under-contribute to the weighted total. Equal-mode tabs, empty tabs, and
// balanced custom tabs return false. Compared in integer cents to dodge float
// noise (grades/weights are stored to 2dp).
export const customTabImbalanced = (
  tab: Pick<TabData, 'id' | 'weightMode' | 'gradebookWeight'>,
  assessments: Pick<
    AssessmentData,
    'tabId' | 'gradebookWeight' | 'gradebookExcluded'
  >[],
): boolean => {
  if (tab.weightMode !== 'custom') return false;
  const included = assessments.filter(
    (a) => a.tabId === tab.id && !a.gradebookExcluded,
  );
  if (included.length === 0) return false;
  const sumCents = included.reduce(
    (acc, a) => acc + Math.round((a.gradebookWeight ?? 0) * 100),
    0,
  );
  return sumCents !== Math.round((tab.gradebookWeight ?? 0) * 100);
};

const r2 = (n: number): number => Math.round(n * 100) / 100;

// Ids of tabs that have at least one assessment — only these are eligible for a
// default weight (an empty tab carries no grades, so weighting it is wasted).
const nonEmptyTabIds = (
  tabs: TabData[],
  assessments: Pick<AssessmentData, 'tabId'>[],
): number[] => {
  const populated = new Set(assessments.map((a) => a.tabId));
  return tabs.filter((t) => populated.has(t.id)).map((t) => t.id);
};

// True when no tab weight has been configured (every weight is 0/null) yet there
// is at least one tab to weight — i.e. the table is showing the equal-split
// default rather than an instructor's configuration. Drives the "default weights"
// banner and dialog pre-fill so both read from one source of truth.
export const usingDefaultWeights = (
  tabs: TabData[],
  assessments: Pick<AssessmentData, 'tabId'>[],
): boolean =>
  sumWeights(tabs) === 0 && nonEmptyTabIds(tabs, assessments).length > 0;

// When no weights are configured, distribute 100 equally across non-empty tabs so
// the weighted view is meaningful out of the box; the last such tab absorbs the
// rounding remainder so the result sums to exactly 100. Returns the input array
// unchanged (same reference) once any tab carries a weight, so a real configuration
// is never overwritten.
export const resolveTabWeights = (
  tabs: TabData[],
  assessments: Pick<AssessmentData, 'tabId'>[],
): TabData[] => {
  if (sumWeights(tabs) !== 0) return tabs;
  const ids = nonEmptyTabIds(tabs, assessments);
  const n = ids.length;
  if (n === 0) return tabs;
  const base = r2(100 / n);
  const weightById = new Map<number, number>(
    ids.map((id, i) => [id, i === n - 1 ? r2(100 - base * (n - 1)) : base]),
  );
  return tabs.map((tab) =>
    weightById.has(tab.id)
      ? {
          ...tab,
          gradebookWeight: weightById.get(tab.id),
          weightMode: tab.weightMode ?? 'equal',
        }
      : tab,
  );
};
