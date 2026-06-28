import type { AssessmentData, SubmissionData } from 'types/course/gradebook';

import { externalClamp, outOfRangeSummary } from '../outOfRange';

const MIDTERMS = 'Midterms';

const ext = (over: Partial<AssessmentData>): AssessmentData => ({
  id: 1,
  title: MIDTERMS,
  tabId: -1,
  maxGrade: 100,
  external: true,
  floorAtZero: true,
  capAtMaximum: true,
  ...over,
});
const sub = (assessmentId: number, grade: number | null): SubmissionData => ({
  studentId: 1,
  assessmentId,
  grade,
});

describe('outOfRangeSummary', () => {
  it('counts grades above max only when capped, below 0 only when floored', () => {
    const assessments = [
      ext({ id: 1, capAtMaximum: true, floorAtZero: true }),
      ext({ id: 2, capAtMaximum: false, floorAtZero: false, maxGrade: 50 }),
    ];
    const submissions = [
      sub(1, 105), // counted (capped)
      sub(1, -3), // counted (floored)
      sub(2, 999), // NOT counted (cap off)
      sub(2, -9), // NOT counted (floor off)
    ];
    expect(outOfRangeSummary(assessments, submissions)).toEqual({
      gradeCount: 2,
      assessmentNames: [MIDTERMS],
    });
  });

  it('counts each offending grade but de-dups assessment names by id', () => {
    const assessments = [
      ext({ id: 1, title: 'Quiz A', maxGrade: 100 }),
      ext({ id: 2, title: 'Quiz B', maxGrade: 100 }),
    ];
    const submissions = [
      sub(1, 105), // over
      sub(1, -1), // under (same assessment)
      sub(2, 200), // over (different assessment)
    ];
    expect(outOfRangeSummary(assessments, submissions)).toEqual({
      gradeCount: 3,
      assessmentNames: ['Quiz A', 'Quiz B'],
    });
  });

  it('treats grade exactly at maxGrade as in range when capped', () => {
    expect(
      outOfRangeSummary([ext({ id: 1, maxGrade: 100 })], [sub(1, 100)]),
    ).toEqual({ gradeCount: 0, assessmentNames: [] });
  });

  it('treats grade exactly at 0 as in range when floored', () => {
    expect(
      outOfRangeSummary([ext({ id: 1, floorAtZero: true })], [sub(1, 0)]),
    ).toEqual({ gradeCount: 0, assessmentNames: [] });
  });

  it('ignores null grades and in-range grades', () => {
    expect(
      outOfRangeSummary([ext({ id: 1 })], [sub(1, null), sub(1, 50)]),
    ).toEqual({ gradeCount: 0, assessmentNames: [] });
  });

  it('ignores native (non-external) assessments', () => {
    const native = ext({ id: 9, external: false });
    expect(outOfRangeSummary([native], [sub(9, 999)])).toEqual({
      gradeCount: 0,
      assessmentNames: [],
    });
  });

  it('ignores submissions with no matching assessment', () => {
    expect(outOfRangeSummary([ext({ id: 1 })], [sub(404, 999)])).toEqual({
      gradeCount: 0,
      assessmentNames: [],
    });
  });
});

describe('externalClamp', () => {
  it('records above/below per student and per assessment, respecting toggles', () => {
    const assessments = [
      ext({ id: 1, capAtMaximum: true, floorAtZero: true, maxGrade: 100 }),
      ext({ id: 2, capAtMaximum: false, floorAtZero: false, maxGrade: 50 }),
    ];
    const submissions = [
      { studentId: 1, assessmentId: 1, grade: 105 }, // capped -> above
      { studentId: 2, assessmentId: 1, grade: -3 }, // floored -> below
      { studentId: 3, assessmentId: 2, grade: 999 }, // cap off -> ignored
    ];
    const { byStudent, byAssessment } = externalClamp(assessments, submissions);
    expect(byStudent.get('1:1')).toEqual({
      bound: 'above',
      raw: 105,
      max: 100,
    });
    expect(byStudent.get('2:1')).toEqual({ bound: 'below', raw: -3, max: 100 });
    expect(byStudent.has('3:2')).toBe(false);
    expect(byAssessment.get(1)).toEqual({ above: true, below: true });
    expect(byAssessment.has(2)).toBe(false);
  });

  it('treats a grade exactly at the bound as in range', () => {
    const { byStudent } = externalClamp(
      [ext({ id: 1, maxGrade: 100 })],
      [
        { studentId: 1, assessmentId: 1, grade: 100 },
        { studentId: 2, assessmentId: 1, grade: 0 },
      ],
    );
    expect(byStudent.size).toBe(0);
  });

  it('ignores null grades, in-range grades, and non-external assessments', () => {
    const { byStudent, byAssessment } = externalClamp(
      [ext({ id: 1, maxGrade: 100 }), ext({ id: 9, external: false })],
      [
        { studentId: 1, assessmentId: 1, grade: null },
        { studentId: 1, assessmentId: 1, grade: 50 },
        { studentId: 2, assessmentId: 9, grade: 999 },
      ],
    );
    expect(byStudent.size).toBe(0);
    expect(byAssessment.size).toBe(0);
  });
});
