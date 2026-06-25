// client/app/bundles/course/gradebook/computeWeighted.ts
import {
  AssessmentData,
  StudentData,
  SubmissionData,
  TabData,
} from 'types/course/gradebook';

type GradeEntry = Pick<SubmissionData, 'studentId' | 'assessmentId' | 'grade'>;

export interface WeightedRow {
  studentId: number;
  name: string;
  email: string;
  externalId: string | null;
  subtotals: (number | null)[];
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
}

export interface TabBreakdown {
  tabId: number;
  assessments: AssessmentContribution[];
}

type GradeLookup = Map<string, number>;

const gradeKey = (studentId: number, assessmentId: number): string =>
  `${studentId}:${assessmentId}`;

// Per-assessment grade bounding (external assessments only). Applied at READ time
// so the toggles stay reversible and the stored grade is never mutated. Native
// assessments leave both flags undefined → passthrough (unchanged behaviour).
export const effectiveGrade = (
  grade: number,
  a: Pick<AssessmentData, 'maxGrade' | 'floorAtZero' | 'capAtMaximum'>,
): number => {
  let g = grade;
  if (a.floorAtZero && g < 0) g = 0;
  if (a.capAtMaximum && g > a.maxGrade) g = a.maxGrade;
  return g;
};

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
// contribute 0. Returns null when no assessment is included.
const equalSubtotal = (
  studentId: number,
  tabAssessments: AssessmentData[],
  gradeLookup: GradeLookup,
): number | null => {
  const included = tabAssessments.filter((a) => !a.gradebookExcluded);
  if (included.length === 0) return null;
  const ratios = included.map((a) => {
    const grade = gradeLookup.get(gradeKey(studentId, a.id));
    return grade != null ? effectiveGrade(grade, a) / a.maxGrade : 0;
  });
  return ratios.reduce((acc, r) => acc + r, 0) / ratios.length;
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
      numerator += (effectiveGrade(grade, a) / a.maxGrade) * assessmentWeight;
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
  return equalSubtotal(studentId, tabAssessments, gradeLookup);
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
}

export const computeStudentTotal = ({
  studentId,
  tabs,
  assessments,
  submissions,
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
  return totalFromSubtotals(subtotals, tabs);
};

export const computeStudentBreakdown = ({
  studentId,
  tabs,
  assessments,
  submissions,
}: TotalArgs): TabBreakdown[] => {
  const gradeLookup = buildGradeLookup(submissions);
  const assessmentsByTab = buildAssessmentsByTab(assessments);
  return tabs.map((tab) => {
    const list = assessmentsByTab.get(tab.id) ?? [];
    const weight = tab.gradebookWeight ?? 0;
    const includedCount = list.filter((a) => !a.gradebookExcluded).length;

    const contributions = list.map((a) => {
      const excluded = !!a.gradebookExcluded;
      const grade = gradeLookup.get(gradeKey(studentId, a.id)) ?? null;
      const ratio = grade != null ? effectiveGrade(grade, a) / a.maxGrade : 0;
      let points: number;
      let effectiveWeight: number;
      if (excluded) {
        points = 0;
        effectiveWeight = 0;
      } else if (tab.weightMode === 'custom') {
        points = ratio * (a.gradebookWeight ?? 0);
        effectiveWeight = a.gradebookWeight ?? 0;
      } else {
        points = includedCount > 0 ? (ratio / includedCount) * weight : 0;
        effectiveWeight = includedCount > 0 ? weight / includedCount : 0;
      }
      return {
        assessmentId: a.id,
        title: a.title,
        grade,
        maxGrade: a.maxGrade,
        points,
        effectiveWeight,
        excluded,
      };
    });
    return { tabId: tab.id, assessments: contributions };
  });
};

interface WeightedRowsArgs {
  students: StudentData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  submissions: GradeEntry[];
}

// Batch entry point used by the table: builds the indexes ONCE and reuses them
// across every student, computing each subtotal a single time.
export const computeWeightedRows = ({
  students,
  tabs,
  assessments,
  submissions,
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
    return {
      studentId: student.id,
      name: student.name,
      email: student.email,
      externalId: student.externalId,
      subtotals,
      total: totalFromSubtotals(subtotals, tabs),
    };
  });
};

export const sumWeights = (tabs: TabData[]): number =>
  tabs.reduce((acc, t) => acc + (t.gradebookWeight ?? 0), 0);

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
