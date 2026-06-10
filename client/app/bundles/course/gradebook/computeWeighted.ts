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
  level: number;
  totalXp: number;
  subtotals: (number | null)[];
  total: number | null;
}

export interface AssessmentContribution {
  assessmentId: number;
  title: string;
  grade: number | null;
  maxGrade: number;
  points: number; // contribution to this tab's weighted-points cell
}

export interface TabBreakdown {
  tabId: number;
  assessments: AssessmentContribution[];
}

type GradeLookup = Map<string, number>;

const gradeKey = (studentId: number, assessmentId: number): string =>
  `${studentId}:${assessmentId}`;

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

// Equal-weight formula: average of (grade/maxGrade) ratios.
// All assessments count in the denominator; ungraded contribute 0 (n = n_total).
const equalSubtotal = (
  studentId: number,
  tabAssessments: AssessmentData[],
  gradeLookup: GradeLookup,
): number | null => {
  let numerator = 0;
  let count = 0;
  tabAssessments.forEach((a) => {
    const grade = gradeLookup.get(gradeKey(studentId, a.id));
    if (grade != null) {
      numerator += grade / a.maxGrade;
      count++;
    } else {
      count++;
    }
  });
  return count > 0 ? numerator / count : null;
};

// Custom-weight formula: Σ(grade_i/maxGrade_i × assessmentWeight_i) / tabWeight.
// Returns null if tabWeight=0 or no assessments; ungraded assessments contribute 0.
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
    const grade = gradeLookup.get(gradeKey(studentId, a.id));
    const assessmentWeight = a.gradebookWeight ?? 0;
    if (grade != null) {
      numerator += (grade / a.maxGrade) * assessmentWeight;
      hasContributing = true;
    } else {
      hasContributing = true;
    }
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
    const n = list.length;
    const contributions = list.map((a) => {
      const grade = gradeLookup.get(gradeKey(studentId, a.id)) ?? null;
      const ratio = grade != null ? grade / a.maxGrade : 0;
      const points =
        tab.weightMode === 'custom'
          ? ratio * (a.gradebookWeight ?? 0)
          : n > 0
            ? (ratio / n) * weight
            : 0;
      return {
        assessmentId: a.id,
        title: a.title,
        grade,
        maxGrade: a.maxGrade,
        points,
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
      level: student.level,
      totalXp: student.totalXp,
      subtotals,
      total: totalFromSubtotals(subtotals, tabs),
    };
  });
};

export const sumWeights = (tabs: TabData[]): number =>
  tabs.reduce((acc, t) => acc + (t.gradebookWeight ?? 0), 0);
