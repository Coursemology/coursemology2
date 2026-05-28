import type {
  AssessmentData,
  SubmissionData,
  TabData,
} from 'types/course/gradebook';

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
}: SubtotalArgs): number | null => {
  const tabAssessments = assessments.filter((a) => a.tabId === tab.id);
  if (tabAssessments.length === 0) return null;

  let numerator = 0;
  let denominator = 0;
  tabAssessments.forEach((a) => {
    const grade = submissions.find(
      (s) => s.studentId === studentId && s.assessmentId === a.id,
    )?.grade;
    if (grade != null) {
      numerator += grade;
      denominator += a.maxGrade;
    } else if (treatUngradedAsZero) {
      denominator += a.maxGrade;
    }
  });
  return denominator > 0 ? numerator / denominator : null;
};

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
  // Build per-student O(1) lookup map to avoid O(n) scans per assessment
  const gradeByAssessmentId = new Map<number, number | null>();
  submissions.forEach((s) => {
    if (s.studentId === studentId)
      gradeByAssessmentId.set(s.assessmentId, s.grade);
  });

  const { weightedSum, weightSum } = tabs.reduce(
    (acc, tab) => {
      const weight = tab.gradebookWeight ?? 0;
      if (weight <= 0) return acc;

      const tabAssessments = assessments.filter((a) => a.tabId === tab.id);
      if (tabAssessments.length === 0) return acc;

      let numerator = 0;
      let denominator = 0;
      tabAssessments.forEach((a) => {
        const grade = gradeByAssessmentId.get(a.id);
        if (grade != null) {
          numerator += grade;
          denominator += a.maxGrade;
        } else if (treatUngradedAsZero) {
          denominator += a.maxGrade;
        }
      });

      const sub = denominator > 0 ? numerator / denominator : null;
      if (sub == null) return acc;
      return {
        weightedSum: acc.weightedSum + weight * sub,
        weightSum: acc.weightSum + weight,
      };
    },
    { weightedSum: 0, weightSum: 0 },
  );
  return weightSum > 0 ? weightedSum / weightSum : null;
};

export const sumWeights = (tabs: TabData[]): number =>
  tabs.reduce((acc, t) => acc + (t.gradebookWeight ?? 0), 0);
