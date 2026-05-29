// client/app/bundles/course/gradebook/__tests__/computeWeighted.test.ts
import {
  computeStudentTotal,
  computeTabSubtotal,
  computeWeightedRows,
  sumWeights,
} from '../computeWeighted';

const assessments = [
  { id: 1, tabId: 10, maxGrade: 100, title: 'A' },
  { id: 2, tabId: 10, maxGrade: 50, title: 'B' },
  { id: 3, tabId: 20, maxGrade: 100, title: 'C' },
];

const subs = (
  entries: { studentId: number; assessmentId: number; grade: number | null }[],
): { studentId: number; assessmentId: number; grade: number | null }[] =>
  entries;

describe('computeTabSubtotal', () => {
  it('returns null when tab has no assessments', () => {
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 999, title: 'X', categoryId: 0 },
        assessments,
        submissions: [],
        treatUngradedAsZero: false,
      }),
    ).toBeNull();
  });

  it('returns null when student has no graded submissions and toggle off', () => {
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 10, title: 'M', categoryId: 0 },
        assessments,
        submissions: [],
        treatUngradedAsZero: false,
      }),
    ).toBeNull();
  });

  it('sum-of-points across graded only when toggle off', () => {
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 10, title: 'M', categoryId: 0 },
        assessments,
        submissions: subs([
          { studentId: 1, assessmentId: 1, grade: 80 },
          // assessment 2 ungraded
        ]),
        treatUngradedAsZero: false,
      }),
    ).toBeCloseTo(0.8);
  });

  it('includes ungraded as zero when toggle on', () => {
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 10, title: 'M', categoryId: 0 },
        assessments,
        submissions: subs([{ studentId: 1, assessmentId: 1, grade: 80 }]),
        treatUngradedAsZero: true,
      }),
    ).toBeCloseTo(80 / 150);
  });
});

describe('computeStudentTotal', () => {
  const tabs = [
    { id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 },
    { id: 20, title: 'T', categoryId: 0, gradebookWeight: 40 },
  ];

  it('returns additive sum of weight × subtotal', () => {
    // tab10 subtotal = (80+50)/(100+50) = 130/150 ≈ 0.8667; tab20 subtotal = 90/100 = 0.9
    // total = 60*(130/150) + 40*0.9 = 52 + 36 = 88
    const total = computeStudentTotal({
      studentId: 1,
      tabs,
      assessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 80 },
        { studentId: 1, assessmentId: 2, grade: 50 },
        { studentId: 1, assessmentId: 3, grade: 90 },
      ]),
      treatUngradedAsZero: false,
    });
    expect(total).toBeCloseTo(60 * (130 / 150) + 40 * 0.9);
  });

  it('weight-0 tab contributes 0 to the sum', () => {
    // tab20 weight=0 → 0 * 0.9 = 0; total = 100*(130/150)
    const total = computeStudentTotal({
      studentId: 1,
      tabs: [
        { id: 10, title: 'M', categoryId: 0, gradebookWeight: 100 },
        { id: 20, title: 'T', categoryId: 0, gradebookWeight: 0 },
      ],
      assessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 80 },
        { studentId: 1, assessmentId: 2, grade: 50 },
        { studentId: 1, assessmentId: 3, grade: 90 },
      ]),
      treatUngradedAsZero: false,
    });
    expect(total).toBeCloseTo(100 * (130 / 150));
  });

  it('returns null when no tab has a non-null subtotal', () => {
    expect(
      computeStudentTotal({
        studentId: 1,
        tabs: [{ id: 10, title: 'M', categoryId: 0, gradebookWeight: 0 }],
        assessments,
        submissions: [],
        treatUngradedAsZero: false,
      }),
    ).toBeNull();
  });

  it('is additive (not normalized) when weights do not sum to 100', () => {
    // total = 60*(130/150) + 30*0.9 = 52 + 27 = 79 (NOT divided by 90)
    const total = computeStudentTotal({
      studentId: 1,
      tabs: [
        { id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 },
        { id: 20, title: 'T', categoryId: 0, gradebookWeight: 30 },
      ],
      assessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 80 },
        { studentId: 1, assessmentId: 2, grade: 50 },
        { studentId: 1, assessmentId: 3, grade: 90 },
      ]),
      treatUngradedAsZero: false,
    });
    expect(total).toBeCloseTo(60 * (130 / 150) + 30 * 0.9);
  });

  it('bonus: weights summing past 100 yield a total > 100 for a perfect student', () => {
    // perfect student: all grades = maxGrade → subtotal = 1.0 per tab
    // total = 60*1 + 50*1 = 110
    const bonusTabs = [
      { id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 },
      { id: 20, title: 'T', categoryId: 0, gradebookWeight: 50 },
    ];
    const total = computeStudentTotal({
      studentId: 1,
      tabs: bonusTabs,
      assessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 100 },
        { studentId: 1, assessmentId: 2, grade: 50 },
        { studentId: 1, assessmentId: 3, grade: 100 },
      ]),
      treatUngradedAsZero: false,
    });
    expect(total).toBeCloseTo(110);
    expect(total!).toBeGreaterThan(100);
  });

  it('ungraded tab (null subtotal) contributes 0, lowering the total', () => {
    // student has grades for tab10 only; tab20 has no submissions → subtotal null → 0 contribution
    // total = 60*(130/150) + 0 (tab20 not counted because null)
    const total = computeStudentTotal({
      studentId: 1,
      tabs,
      assessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 80 },
        { studentId: 1, assessmentId: 2, grade: 50 },
        // no submission for assessment 3 (tab20)
      ]),
      treatUngradedAsZero: false,
    });
    expect(total).toBeCloseTo(60 * (130 / 150));
  });
});

describe('sumWeights', () => {
  it('returns the sum of all tab weights', () => {
    const tabs = [
      { id: 1, title: 'T1', categoryId: 1, gradebookWeight: 60 },
      { id: 2, title: 'T2', categoryId: 1, gradebookWeight: 40 },
    ];
    expect(sumWeights(tabs)).toBe(100);
  });

  it('includes all tabs regardless of weight value', () => {
    const tabs = [
      { id: 1, title: 'T1', categoryId: 1, gradebookWeight: 60 },
      { id: 2, title: 'T2', categoryId: 1, gradebookWeight: 0 },
    ];
    expect(sumWeights(tabs)).toBe(60);
  });

  it('handles tabs with no gradebookWeight (treats as 0)', () => {
    const tabs = [
      { id: 1, title: 'T1', categoryId: 1, gradebookWeight: 40 },
      { id: 2, title: 'T2', categoryId: 1 },
    ];
    expect(sumWeights(tabs)).toBe(40);
  });
});

describe('computeWeightedRows', () => {
  const rowTabs = [
    { id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 },
    { id: 20, title: 'T', categoryId: 0, gradebookWeight: 40 },
  ];
  const rowStudents = [
    {
      id: 1,
      name: 'Alice',
      email: 'alice@e.com',
      externalId: null,
      level: 1,
      totalXp: 0,
    },
    {
      id: 2,
      name: 'Bob',
      email: 'bob@e.com',
      externalId: null,
      level: 1,
      totalXp: 0,
    },
  ];
  const rowSubmissions = subs([
    // Alice: full data
    { studentId: 1, assessmentId: 1, grade: 80 },
    { studentId: 1, assessmentId: 2, grade: 50 },
    { studentId: 1, assessmentId: 3, grade: 90 },
    // Bob: only tab10 graded
    { studentId: 2, assessmentId: 1, grade: 100 },
    { studentId: 2, assessmentId: 2, grade: 50 },
  ]);

  it('returns one row per student carrying studentId, name and email', () => {
    const rows = computeWeightedRows({
      students: rowStudents,
      tabs: rowTabs,
      assessments,
      submissions: rowSubmissions,
      treatUngradedAsZero: false,
    });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      studentId: 1,
      name: 'Alice',
      email: 'alice@e.com',
    });
    expect(rows[1]).toMatchObject({
      studentId: 2,
      name: 'Bob',
      email: 'bob@e.com',
    });
  });

  it('produces subtotals and total identical to the per-student helpers', () => {
    const rows = computeWeightedRows({
      students: rowStudents,
      tabs: rowTabs,
      assessments,
      submissions: rowSubmissions,
      treatUngradedAsZero: false,
    });
    rowStudents.forEach((student, i) => {
      rowTabs.forEach((tab, j) => {
        expect(rows[i].subtotals[j]).toEqual(
          computeTabSubtotal({
            studentId: student.id,
            tab,
            assessments,
            submissions: rowSubmissions,
            treatUngradedAsZero: false,
          }),
        );
      });
      expect(rows[i].total).toEqual(
        computeStudentTotal({
          studentId: student.id,
          tabs: rowTabs,
          assessments,
          submissions: rowSubmissions,
          treatUngradedAsZero: false,
        }),
      );
    });
  });

  it('computes the known additive total for a fully-graded student', () => {
    // Alice tab10 = (80+50)/(100+50) = 130/150; tab20 = 90/100 = 0.9
    // total = 60*(130/150) + 40*0.9
    const rows = computeWeightedRows({
      students: [rowStudents[0]],
      tabs: rowTabs,
      assessments,
      submissions: rowSubmissions,
      treatUngradedAsZero: false,
    });
    expect(rows[0].subtotals[0]).toBeCloseTo(130 / 150);
    expect(rows[0].subtotals[1]).toBeCloseTo(0.9);
    expect(rows[0].total).toBeCloseTo(60 * (130 / 150) + 40 * 0.9);
  });

  it('a tab with no graded submissions yields a null subtotal (toggle off)', () => {
    // Bob has no tab20 submissions -> subtotal null; total counts tab10 only
    const rows = computeWeightedRows({
      students: [rowStudents[1]],
      tabs: rowTabs,
      assessments,
      submissions: rowSubmissions,
      treatUngradedAsZero: false,
    });
    expect(rows[0].subtotals[0]).toBeCloseTo(1); // (100+50)/(100+50)=1
    expect(rows[0].subtotals[1]).toBeNull();
    expect(rows[0].total).toBeCloseTo(60 * 1);
  });

  it('treatUngradedAsZero counts ungraded assessments in the denominator', () => {
    // Bob tab20 has assessment 3 ungraded -> with toggle on subtotal = 0/100 = 0 (not null)
    const rows = computeWeightedRows({
      students: [rowStudents[1]],
      tabs: rowTabs,
      assessments,
      submissions: rowSubmissions,
      treatUngradedAsZero: true,
    });
    expect(rows[0].subtotals[1]).toBe(0);
    // tab10 with toggle on stays (100+50)/(100+50)=1
    expect(rows[0].subtotals[0]).toBeCloseTo(1);
    expect(rows[0].total).toBeCloseTo(60 * 1 + 40 * 0);
  });

  it('returns an empty array when there are no students', () => {
    expect(
      computeWeightedRows({
        students: [],
        tabs: rowTabs,
        assessments,
        submissions: rowSubmissions,
        treatUngradedAsZero: false,
      }),
    ).toEqual([]);
  });
});

describe('computeWeightedRows — identity passthrough', () => {
  it('carries level and totalXp from each student onto the row', () => {
    const students = [
      {
        id: 1,
        name: 'Alice',
        email: 'a@x.com',
        externalId: null,
        level: 5,
        totalXp: 1234,
      },
    ];
    const tabs = [
      { id: 10, title: 'Tab 1', categoryId: 1, gradebookWeight: 100 },
    ];
    const localAssessments = [{ id: 100, title: 'Q1', tabId: 10, maxGrade: 10 }];
    const submissions = [{ studentId: 1, assessmentId: 100, grade: 8 }];

    const rows = computeWeightedRows({
      students,
      tabs,
      assessments: localAssessments,
      submissions,
      treatUngradedAsZero: false,
    });

    expect(rows[0].level).toBe(5);
    expect(rows[0].totalXp).toBe(1234);
  });
});
