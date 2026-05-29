// client/app/bundles/course/gradebook/computeWeighted.ts
import {
  AssessmentData,
  StudentData,
  SubmissionData,
  TabData,
} from 'types/course/gradebook';

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

type GradeLookup = Map<string, number>;

const gradeKey = (studentId: number, assessmentId: number): string =>
  `${studentId}:${assessmentId}`;

// Index submissions by (student, assessment) once: O(submissions).
const buildGradeLookup = (submissions: SubmissionData[]): GradeLookup => {
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

// Single source of truth for the subtotal math, operating on prebuilt indexes.
const subtotalFromLookup = (
  studentId: number,
  tabAssessments: AssessmentData[] | undefined,
  gradeLookup: GradeLookup,
  treatUngradedAsZero: boolean,
): number | null => {
  if (!tabAssessments || tabAssessments.length === 0) return null;
  let numerator = 0;
  let denominator = 0;
  tabAssessments.forEach((a) => {
    const grade = gradeLookup.get(gradeKey(studentId, a.id));
    if (grade != null) {
      numerator += grade;
      denominator += a.maxGrade;
    } else if (treatUngradedAsZero) {
      denominator += a.maxGrade;
    }
  });
  return denominator > 0 ? numerator / denominator : null;
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
  submissions: SubmissionData[];
  treatUngradedAsZero: boolean;
}

export const computeTabSubtotal = ({
  studentId,
  tab,
  assessments,
  submissions,
  treatUngradedAsZero,
}: SubtotalArgs): number | null =>
  subtotalFromLookup(
    studentId,
    assessments.filter((a) => a.tabId === tab.id),
    buildGradeLookup(submissions),
    treatUngradedAsZero,
  );

interface TotalArgs {
  studentId: number;
  tabs: TabData[];
  assessments: AssessmentData[];
  submissions: SubmissionData[];
  treatUngradedAsZero: boolean;
}

export const computeStudentTotal = ({
  studentId,
  tabs,
  assessments,
  submissions,
  treatUngradedAsZero,
}: TotalArgs): number | null => {
  const gradeLookup = buildGradeLookup(submissions);
  const assessmentsByTab = buildAssessmentsByTab(assessments);
  const subtotals = tabs.map((tab) =>
    subtotalFromLookup(
      studentId,
      assessmentsByTab.get(tab.id),
      gradeLookup,
      treatUngradedAsZero,
    ),
  );
  return totalFromSubtotals(subtotals, tabs);
};

interface WeightedRowsArgs {
  students: StudentData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  submissions: SubmissionData[];
  treatUngradedAsZero: boolean;
}

// Batch entry point used by the table: builds the indexes ONCE and reuses them
// across every student, computing each subtotal a single time.
export const computeWeightedRows = ({
  students,
  tabs,
  assessments,
  submissions,
  treatUngradedAsZero,
}: WeightedRowsArgs): WeightedRow[] => {
  const gradeLookup = buildGradeLookup(submissions);
  const assessmentsByTab = buildAssessmentsByTab(assessments);
  return students.map((student) => {
    const subtotals = tabs.map((tab) =>
      subtotalFromLookup(
        student.id,
        assessmentsByTab.get(tab.id),
        gradeLookup,
        treatUngradedAsZero,
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
