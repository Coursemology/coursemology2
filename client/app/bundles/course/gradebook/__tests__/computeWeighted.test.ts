import { computeTabSubtotal, computeStudentTotal, sumWeights } from '../computeWeighted';

const assessments = [
  { id: 1, tabId: 10, maxGrade: 100, title: 'A' },
  { id: 2, tabId: 10, maxGrade: 50, title: 'B' },
  { id: 3, tabId: 20, maxGrade: 100, title: 'C' },
];

const subs = (
  entries: { studentId: number; assessmentId: number; grade: number | null }[],
) => entries;

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

  it('weighted average over weighted tabs', () => {
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
    // tab 10 subtotal = 130/150; tab 20 subtotal = 90/100
    // total = (60*(130/150) + 40*0.9) / 100
    expect(total).toBeCloseTo((60 * (130 / 150) + 40 * 0.9) / 100);
  });

  it('excludes tabs with weight 0', () => {
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
      ]),
      treatUngradedAsZero: false,
    });
    expect(total).toBeCloseTo(130 / 150);
  });

  it('returns null when no weighted tab contributes', () => {
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

  it('normalizes when weights do not sum to 100', () => {
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
    // weightSum = 90; total = (60*(130/150) + 30*0.9)/90
    expect(total).toBeCloseTo((60 * (130 / 150) + 30 * 0.9) / 90);
  });
});

describe('sumWeights', () => {
  it('sums gradebookWeight across tabs', () => {
    const tabs = [
      { id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 },
      { id: 20, title: 'T', categoryId: 0, gradebookWeight: 40 },
    ];
    expect(sumWeights(tabs)).toBe(100);
  });

  it('treats undefined gradebookWeight as 0', () => {
    const tabs = [
      { id: 10, title: 'M', categoryId: 0 },
      { id: 20, title: 'T', categoryId: 0, gradebookWeight: 50 },
    ];
    expect(sumWeights(tabs)).toBe(50);
  });
});
