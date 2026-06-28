import type { AssessmentData, SubmissionData } from 'types/course/gradebook';

export interface OutOfRangeSummary {
  gradeCount: number;
  assessmentNames: string[];
}

// Counts external grades that an ACTIVE bound is silently adjusting in the
// weighted total: above max only when capped, below 0 only when floored. A
// disabled toggle clamps nothing, so those grades are not flagged. Read-only —
// never mutates anything (mirrors effectiveGrade's read-time contract).
export const outOfRangeSummary = (
  assessments: AssessmentData[],
  submissions: Pick<SubmissionData, 'assessmentId' | 'grade'>[],
): OutOfRangeSummary => {
  const byId = new Map<number, AssessmentData>();
  assessments.forEach((a) => {
    if (a.external) byId.set(a.id, a);
  });

  let gradeCount = 0;
  const offending = new Map<number, string>();
  submissions.forEach((s) => {
    if (s.grade == null) return;
    const a = byId.get(s.assessmentId);
    if (!a) return;
    const over = (a.capAtMaximum ?? false) && s.grade > a.maxGrade;
    const under = (a.floorAtZero ?? false) && s.grade < 0;
    if (over || under) {
      gradeCount += 1;
      offending.set(a.id, a.title);
    }
  });

  return { gradeCount, assessmentNames: Array.from(offending.values()) };
};
