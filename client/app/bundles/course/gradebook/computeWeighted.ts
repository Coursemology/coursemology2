import type { AssessmentData, SubmissionData, TabData } from 'types/course/gradebook';

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
  for (const a of tabAssessments) {
    const grade = submissions.find(
      (s) => s.studentId === studentId && s.assessmentId === a.id,
    )?.grade;
    if (grade != null) {
      numerator += grade;
      denominator += a.maxGrade;
    } else if (treatUngradedAsZero) {
      denominator += a.maxGrade;
    }
  }
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
  let weightedSum = 0;
  let weightSum = 0;
  for (const tab of tabs) {
    const weight = tab.gradebookWeight ?? 0;
    if (weight <= 0) continue;
    const sub = computeTabSubtotal({
      studentId,
      tab,
      assessments,
      submissions,
      treatUngradedAsZero,
    });
    if (sub == null) continue;
    weightedSum += weight * sub;
    weightSum += weight;
  }
  return weightSum > 0 ? weightedSum / weightSum : null;
};

export const sumWeights = (tabs: TabData[]): number =>
  tabs.reduce((acc, t) => acc + (t.gradebookWeight ?? 0), 0);
