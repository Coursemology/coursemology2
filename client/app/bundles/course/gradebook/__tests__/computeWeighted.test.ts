// client/app/bundles/course/gradebook/__tests__/computeWeighted.test.ts
import type { LevelContributionData } from 'types/course/gradebook';

import {
  computeStudentBreakdown,
  computeStudentTotal,
  computeTabSubtotal,
  computeWeightedRows,
  LEVEL_TAB_ID,
  levelOffenders,
  levelOutOfRange,
  resolveTabWeights,
  sumWeights,
  usingDefaultWeights,
} from '../computeWeighted';
import { parseFormula } from '../levelFormula';

const assessments = [
  { id: 1, tabId: 10, maxGrade: 100, title: 'A' },
  { id: 2, tabId: 10, maxGrade: 50, title: 'B' },
  { id: 3, tabId: 20, maxGrade: 100, title: 'C' },
];

const subs = (
  entries: { studentId: number; assessmentId: number; grade: number | null }[],
): { studentId: number; assessmentId: number; grade: number | null }[] =>
  entries;

describe('computeTabSubtotal - equal mode (default)', () => {
  it('returns null when tab has no assessments', () => {
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 999, title: 'X', categoryId: 0 },
        assessments,
        submissions: [],
      }),
    ).toBeNull();
  });

  it('returns 0 when student has no graded submissions (ungraded count as 0)', () => {
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 10, title: 'M', categoryId: 0 },
        assessments,
        submissions: [],
      }),
    ).toBe(0);
  });

  it('average of (grade/maxGrade) ratios with ungraded assessments counted as 0', () => {
    // Assessment 1 graded (80/100=0.8), assessment 2 ungraded (0)
    // sub = (0.8 + 0) / 2 = 0.4
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 10, title: 'M', categoryId: 0 },
        assessments,
        submissions: subs([
          { studentId: 1, assessmentId: 1, grade: 80 },
          // assessment 2 ungraded
        ]),
      }),
    ).toBeCloseTo(0.4);
  });

  it('average of all ratios when fully graded', () => {
    // Assessment 1: 80/100=0.8, assessment 2: 50/50=1.0
    // sub = (0.8 + 1.0) / 2 = 0.9
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 10, title: 'M', categoryId: 0 },
        assessments,
        submissions: subs([
          { studentId: 1, assessmentId: 1, grade: 80 },
          { studentId: 1, assessmentId: 2, grade: 50 },
        ]),
      }),
    ).toBeCloseTo(0.9);
  });
});

describe('computeTabSubtotal - custom mode', () => {
  const customTab = {
    id: 10,
    title: 'M',
    categoryId: 0,
    gradebookWeight: 100,
    weightMode: 'custom' as const,
  };
  const customAssessments = [
    { id: 1, tabId: 10, maxGrade: 100, title: 'A', gradebookWeight: 30 },
    { id: 2, tabId: 10, maxGrade: 50, title: 'B', gradebookWeight: 70 },
  ];

  it('computes weighted sum over tab weight when fully graded', () => {
    // sub = (80/100 * 30 + 50/50 * 70) / 100 = (24 + 70) / 100 = 0.94
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: customTab,
        assessments: customAssessments,
        submissions: subs([
          { studentId: 1, assessmentId: 1, grade: 80 },
          { studentId: 1, assessmentId: 2, grade: 50 },
        ]),
      }),
    ).toBeCloseTo(0.94);
  });

  it('treats ungraded as zero (only graded weight contributes to numerator)', () => {
    // Only assessment 1 graded: sub = (80/100 * 30 + 0 * 70) / 100 = 24/100 = 0.24
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: customTab,
        assessments: customAssessments,
        submissions: subs([{ studentId: 1, assessmentId: 1, grade: 80 }]),
      }),
    ).toBeCloseTo(0.24);
  });

  it('returns 0 when no graded assessments', () => {
    // sub = (0 + 0) / 100 = 0
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: customTab,
        assessments: customAssessments,
        submissions: [],
      }),
    ).toBe(0);
  });

  it('returns null when tab gradebookWeight is 0 (divide-by-zero guard)', () => {
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { ...customTab, gradebookWeight: 0 },
        assessments: customAssessments,
        submissions: subs([{ studentId: 1, assessmentId: 1, grade: 80 }]),
      }),
    ).toBeNull();
  });

  it('returns null when every assessment in a custom tab is excluded', () => {
    const allExcluded = [
      {
        id: 1,
        tabId: 10,
        maxGrade: 100,
        title: 'A',
        gradebookWeight: 30,
        gradebookExcluded: true,
      },
      {
        id: 2,
        tabId: 10,
        maxGrade: 100,
        title: 'B',
        gradebookWeight: 20,
        gradebookExcluded: true,
      },
    ];
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: {
          id: 10,
          title: 'M',
          categoryId: 0,
          weightMode: 'custom',
          gradebookWeight: 50,
        },
        assessments: allExcluded,
        submissions: [{ studentId: 1, assessmentId: 1, grade: 90 }],
      }),
    ).toBeNull();
  });

  it('treats a custom assessment with no gradebookWeight as weight 0', () => {
    // a1 weight 30 graded 100/100 -> 30; a2 has NO weight -> 0; sub = 30/100 = 0.3
    const mixed = [
      { id: 1, tabId: 10, maxGrade: 100, title: 'A', gradebookWeight: 30 },
      { id: 2, tabId: 10, maxGrade: 50, title: 'B' },
    ];
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: customTab,
        assessments: mixed,
        submissions: subs([
          { studentId: 1, assessmentId: 1, grade: 100 },
          { studentId: 1, assessmentId: 2, grade: 50 },
        ]),
      }),
    ).toBeCloseTo(0.3);
  });
});

describe('computeStudentTotal', () => {
  const tabs = [
    { id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 },
    { id: 20, title: 'T', categoryId: 0, gradebookWeight: 40 },
  ];

  it('returns additive sum of weight × subtotal (equal-weight count-based)', () => {
    // tab10 equal subtotal = (80/100 + 50/50) / 2 = (0.8 + 1.0) / 2 = 0.9
    // tab20 equal subtotal = 90/100 = 0.9
    // total = 60*0.9 + 40*0.9 = 54 + 36 = 90
    const total = computeStudentTotal({
      studentId: 1,
      tabs,
      assessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 80 },
        { studentId: 1, assessmentId: 2, grade: 50 },
        { studentId: 1, assessmentId: 3, grade: 90 },
      ]),
    });
    expect(total).toBeCloseTo(60 * 0.9 + 40 * 0.9);
  });

  it('weight-0 tab contributes 0 to the sum', () => {
    // tab20 weight=0 → 0; tab10 subtotal = (80/100 + 50/50) / 2 = 0.9
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
    });
    expect(total).toBeCloseTo(100 * 0.9);
  });

  it('returns 0 when tab weight is 0 and no graded submissions', () => {
    expect(
      computeStudentTotal({
        studentId: 1,
        tabs: [{ id: 10, title: 'M', categoryId: 0, gradebookWeight: 0 }],
        assessments,
        submissions: [],
      }),
    ).toBe(0);
  });

  it('is additive (not normalized) when weights do not sum to 100', () => {
    // total = 60*0.9 + 30*0.9 = 54 + 27 = 81 (NOT divided by 90)
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
    });
    expect(total).toBeCloseTo(60 * 0.9 + 30 * 0.9);
  });

  it('bonus: weights summing past 100 yield a total > 100 for a perfect student', () => {
    // perfect student: all grades = maxGrade → each ratio = 1.0 → subtotal = 1.0
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
    });
    expect(total).toBeCloseTo(110);
    expect(total!).toBeGreaterThan(100);
  });

  it('ungraded tab contributes 0 to the total', () => {
    // tab10 subtotal = (80/100 + 50/50) / 2 = 0.9; tab20 no submissions → subtotal = 0
    // total = 60*0.9 + 40*0 = 54
    const total = computeStudentTotal({
      studentId: 1,
      tabs,
      assessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 80 },
        { studentId: 1, assessmentId: 2, grade: 50 },
      ]),
    });
    expect(total).toBeCloseTo(60 * 0.9);
  });

  it('returns null when every tab is empty (no contributing subtotal)', () => {
    expect(
      computeStudentTotal({
        studentId: 1,
        tabs: [
          { id: 77, title: 'X', categoryId: 0, gradebookWeight: 60 },
          { id: 88, title: 'Y', categoryId: 0, gradebookWeight: 40 },
        ],
        assessments, // none belong to tabs 77/88
        submissions: [],
      }),
    ).toBeNull();
  });

  it('a negative tab weight subtracts from the additive total (no flooring)', () => {
    // tab10 subtotal 0.9 * 100 = 90 ; tab20 subtotal 0.9 * -20 = -18 ; total = 72
    const total = computeStudentTotal({
      studentId: 1,
      tabs: [
        { id: 10, title: 'M', categoryId: 0, gradebookWeight: 100 },
        { id: 20, title: 'T', categoryId: 0, gradebookWeight: -20 },
      ],
      assessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 80 },
        { studentId: 1, assessmentId: 2, grade: 50 },
        { studentId: 1, assessmentId: 3, grade: 90 },
      ]),
    });
    expect(total).toBeCloseTo(100 * 0.9 + -20 * 0.9);
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

describe('resolveTabWeights - equal-split default when unconfigured', () => {
  const twoTabs = [
    { id: 10, title: 'M', categoryId: 0, gradebookWeight: 0 },
    { id: 20, title: 'T', categoryId: 0, gradebookWeight: 0 },
  ];
  // assessments fixture (top of file) covers tabs 10 and 20.

  it('returns tabs unchanged when any tab already carries a weight', () => {
    const configured = [
      { id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 },
      { id: 20, title: 'T', categoryId: 0, gradebookWeight: 0 },
    ];
    expect(resolveTabWeights(configured, assessments)).toBe(configured);
  });

  it('splits 100 equally across non-empty tabs when every weight is 0', () => {
    const resolved = resolveTabWeights(twoTabs, assessments);
    expect(resolved.map((t) => t.gradebookWeight)).toEqual([50, 50]);
    expect(sumWeights(resolved)).toBe(100);
  });

  it('last non-empty tab absorbs the rounding remainder so it sums to exactly 100', () => {
    const threeTabs = [
      { id: 10, title: 'A', categoryId: 0, gradebookWeight: 0 },
      { id: 20, title: 'B', categoryId: 0, gradebookWeight: 0 },
      { id: 30, title: 'C', categoryId: 0, gradebookWeight: 0 },
    ];
    const threeAssessments = [
      { id: 1, tabId: 10, maxGrade: 10, title: 'a' },
      { id: 2, tabId: 20, maxGrade: 10, title: 'b' },
      { id: 3, tabId: 30, maxGrade: 10, title: 'c' },
    ];
    const resolved = resolveTabWeights(threeTabs, threeAssessments);
    expect(resolved.map((t) => t.gradebookWeight)).toEqual([
      33.33, 33.33, 33.34,
    ]);
    expect(sumWeights(resolved)).toBe(100);
  });

  it('gives empty tabs (no assessments) 0% and shares 100 among the rest', () => {
    const withEmpty = [
      { id: 10, title: 'M', categoryId: 0, gradebookWeight: 0 },
      { id: 20, title: 'T', categoryId: 0, gradebookWeight: 0 },
      { id: 99, title: 'Empty', categoryId: 0, gradebookWeight: 0 },
    ];
    const resolved = resolveTabWeights(withEmpty, assessments);
    expect(resolved.find((t) => t.id === 99)!.gradebookWeight).toBe(0);
    expect(sumWeights(resolved)).toBe(100);
  });

  it('defaults the weight mode to equal on resolved tabs', () => {
    const resolved = resolveTabWeights(twoTabs, assessments);
    expect(resolved.every((t) => t.weightMode === 'equal')).toBe(true);
  });

  it('returns tabs unchanged when no tab has any assessment (nothing to weight)', () => {
    const emptyTabs = [
      { id: 77, title: 'X', categoryId: 0, gradebookWeight: 0 },
    ];
    expect(resolveTabWeights(emptyTabs, assessments)).toBe(emptyTabs);
  });

  it('gives a lone non-empty tab the full 100', () => {
    const oneTab = [{ id: 10, title: 'M', categoryId: 0, gradebookWeight: 0 }];
    const resolved = resolveTabWeights(oneTab, assessments);
    expect(resolved[0].gradebookWeight).toBe(100);
    expect(sumWeights(resolved)).toBe(100);
  });

  it('preserves an already-set weightMode while injecting the default weight', () => {
    const customModeTabs = [
      {
        id: 10,
        title: 'M',
        categoryId: 0,
        gradebookWeight: 0,
        weightMode: 'custom' as const,
      },
      { id: 20, title: 'T', categoryId: 0, gradebookWeight: 0 },
    ];
    const resolved = resolveTabWeights(customModeTabs, assessments);
    expect(resolved.find((t) => t.id === 10)!.weightMode).toBe('custom');
    expect(resolved.find((t) => t.id === 20)!.weightMode).toBe('equal');
  });
});

describe('usingDefaultWeights', () => {
  it('is true when no weight is configured and a non-empty tab exists', () => {
    const tabs = [{ id: 10, title: 'M', categoryId: 0, gradebookWeight: 0 }];
    expect(usingDefaultWeights(tabs, assessments)).toBe(true);
  });

  it('is false once any tab carries a weight', () => {
    const tabs = [{ id: 10, title: 'M', categoryId: 0, gradebookWeight: 50 }];
    expect(usingDefaultWeights(tabs, assessments)).toBe(false);
  });

  it('is false when every tab is empty (no default would apply)', () => {
    const tabs = [{ id: 77, title: 'X', categoryId: 0, gradebookWeight: 0 }];
    expect(usingDefaultWeights(tabs, assessments)).toBe(false);
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
      levelContribution: null,
    },
    {
      id: 2,
      name: 'Bob',
      email: 'bob@e.com',
      externalId: null,
      level: 1,
      totalXp: 0,
      levelContribution: null,
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
    });
    rowStudents.forEach((student, i) => {
      rowTabs.forEach((tab, j) => {
        expect(rows[i].subtotals[j]).toEqual(
          computeTabSubtotal({
            studentId: student.id,
            tab,
            assessments,
            submissions: rowSubmissions,
          }),
        );
      });
      expect(rows[i].total).toEqual(
        computeStudentTotal({
          studentId: student.id,
          tabs: rowTabs,
          assessments,
          submissions: rowSubmissions,
        }),
      );
    });
  });

  it('computes the known additive total for a fully-graded student (equal-weight)', () => {
    // Alice tab10 = (80/100 + 50/50) / 2 = (0.8 + 1.0) / 2 = 0.9
    // Alice tab20 = 90/100 = 0.9
    // total = 60*0.9 + 40*0.9 = 90
    const rows = computeWeightedRows({
      students: [rowStudents[0]],
      tabs: rowTabs,
      assessments,
      submissions: rowSubmissions,
    });
    expect(rows[0].subtotals[0]).toBeCloseTo(0.9);
    expect(rows[0].subtotals[1]).toBeCloseTo(0.9);
    expect(rows[0].total).toBeCloseTo(60 * 0.9 + 40 * 0.9);
  });

  it('a tab with no graded submissions yields a 0 subtotal (ungraded count as 0)', () => {
    // Bob tab10: (100/100 + 50/50) / 2 = 1.0; tab20: no submissions → 0
    const rows = computeWeightedRows({
      students: [rowStudents[1]],
      tabs: rowTabs,
      assessments,
      submissions: rowSubmissions,
    });
    expect(rows[0].subtotals[0]).toBeCloseTo(1);
    expect(rows[0].subtotals[1]).toBe(0);
    expect(rows[0].total).toBeCloseTo(60 * 1 + 40 * 0);
  });

  it('returns an empty array when there are no students', () => {
    expect(
      computeWeightedRows({
        students: [],
        tabs: rowTabs,
        assessments,
        submissions: rowSubmissions,
      }),
    ).toEqual([]);
  });
});

describe('computeWeightedRows - identity passthrough', () => {
  it('carries name, email and externalId from each student onto the row', () => {
    const students = [
      {
        id: 1,
        name: 'Alice',
        email: 'a@x.com',
        externalId: 'EXT-1',
        level: 5,
        totalXp: 1234,
        levelContribution: null,
      },
    ];
    const tabs = [
      { id: 10, title: 'Tab 1', categoryId: 1, gradebookWeight: 100 },
    ];
    const localAssessments = [
      { id: 100, title: 'Q1', tabId: 10, maxGrade: 10 },
    ];
    const submissions = [{ studentId: 1, assessmentId: 100, grade: 8 }];

    const rows = computeWeightedRows({
      students,
      tabs,
      assessments: localAssessments,
      submissions,
    });

    expect(rows[0].name).toBe('Alice');
    expect(rows[0].email).toBe('a@x.com');
    expect(rows[0].externalId).toBe('EXT-1');
  });
});

describe('computeStudentBreakdown', () => {
  const tabs = [
    { id: 10, title: 'Tab 1', categoryId: 1, gradebookWeight: 60 },
    { id: 20, title: 'Tab 2', categoryId: 1, gradebookWeight: 40 },
  ];

  it('equal mode: per-assessment points sum to the tab cell (subtotal × weight)', () => {
    // Tab 10 (weight 60), equal: A(80/100=0.8), B(50/50=1.0); n=2
    //   A points = (0.8/2)*60 = 24 ; B points = (1.0/2)*60 = 30 ; Σ = 54
    const breakdown = computeStudentBreakdown({
      studentId: 1,
      tabs,
      assessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 80 },
        { studentId: 1, assessmentId: 2, grade: 50 },
        { studentId: 1, assessmentId: 3, grade: 90 },
      ]),
    });
    const tab10 = breakdown.find((b) => b.tabId === 10)!;
    const a = tab10.assessments.find((x) => x.assessmentId === 1)!;
    const b = tab10.assessments.find((x) => x.assessmentId === 2)!;
    expect(a.points).toBeCloseTo(24);
    expect(b.points).toBeCloseTo(30);
    expect(a.points + b.points).toBeCloseTo(54); // = tab cell
  });

  it('carries grade and maxGrade per assessment; ungraded contributes 0 points', () => {
    // Tab 10: A graded 80/100, B ungraded; n=2 → A=(0.8/2)*60=24, B=0
    const breakdown = computeStudentBreakdown({
      studentId: 1,
      tabs,
      assessments,
      submissions: subs([{ studentId: 1, assessmentId: 1, grade: 80 }]),
    });
    const tab10 = breakdown.find((b) => b.tabId === 10)!;
    const b = tab10.assessments.find((x) => x.assessmentId === 2)!;
    expect(b.grade).toBeNull();
    expect(b.maxGrade).toBe(50);
    expect(b.points).toBe(0);
  });

  it('custom mode: per-assessment points = ratio × assessmentWeight, summing to the cell', () => {
    // Tab 10 custom, weight 60: A weight 40 (80/100=0.8 → 32), B weight 20 (50/50=1 → 20)
    //   subtotal = (0.8*40 + 1*20)/60 = 52/60 ; cell = subtotal*60 = 52 ; Σpoints = 32 + 20 = 52
    const customTabs = [
      {
        id: 10,
        title: 'Tab 1',
        categoryId: 1,
        gradebookWeight: 60,
        weightMode: 'custom' as const,
      },
    ];
    const customAssessments = [
      { id: 1, tabId: 10, maxGrade: 100, title: 'A', gradebookWeight: 40 },
      { id: 2, tabId: 10, maxGrade: 50, title: 'B', gradebookWeight: 20 },
    ];
    const breakdown = computeStudentBreakdown({
      studentId: 1,
      tabs: customTabs,
      assessments: customAssessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 80 },
        { studentId: 1, assessmentId: 2, grade: 50 },
      ]),
    });
    const tab10 = breakdown[0];
    const a = tab10.assessments.find((x) => x.assessmentId === 1)!;
    const b = tab10.assessments.find((x) => x.assessmentId === 2)!;
    expect(a.points).toBeCloseTo(32);
    expect(b.points).toBeCloseTo(20);
    expect(a.points + b.points).toBeCloseTo(52); // = tab cell
  });

  it('returns an empty assessment list for a tab with no assessments', () => {
    const breakdown = computeStudentBreakdown({
      studentId: 1,
      tabs: [{ id: 999, title: 'Empty', categoryId: 1, gradebookWeight: 50 }],
      assessments,
      submissions: [],
    });
    expect(breakdown[0].assessments).toEqual([]);
  });
});

describe('exclusion - equal mode', () => {
  it('averages over included assessments only (excluded dropped from numerator and count)', () => {
    // a1 80/100=0.8 included, a2 excluded -> subtotal = 0.8 / 1 = 0.8
    const withExcluded = [
      { id: 1, tabId: 10, maxGrade: 100, title: 'A' },
      { id: 2, tabId: 10, maxGrade: 50, title: 'B', gradebookExcluded: true },
    ];
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 10, title: 'M', categoryId: 0 },
        assessments: withExcluded,
        submissions: [{ studentId: 1, assessmentId: 1, grade: 80 }],
      }),
    ).toBeCloseTo(0.8);
  });

  it('returns null when every assessment in the tab is excluded', () => {
    const allExcluded = [
      { id: 1, tabId: 10, maxGrade: 100, title: 'A', gradebookExcluded: true },
      { id: 2, tabId: 10, maxGrade: 50, title: 'B', gradebookExcluded: true },
    ];
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 10, title: 'M', categoryId: 0 },
        assessments: allExcluded,
        submissions: [{ studentId: 1, assessmentId: 1, grade: 80 }],
      }),
    ).toBeNull();
  });
});

describe('exclusion - custom mode', () => {
  it('drops excluded assessments from the numerator', () => {
    // tab weight 30; a1 weight 30 graded 90/100=0.9 -> 0.9*30=27; a2 excluded.
    // subtotal = 27 / 30 = 0.9
    const customAssessments = [
      { id: 1, tabId: 10, maxGrade: 100, title: 'A', gradebookWeight: 30 },
      {
        id: 2,
        tabId: 10,
        maxGrade: 100,
        title: 'B',
        gradebookWeight: 20,
        gradebookExcluded: true,
      },
    ];
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: {
          id: 10,
          title: 'M',
          categoryId: 0,
          weightMode: 'custom',
          gradebookWeight: 30,
        },
        assessments: customAssessments,
        submissions: [
          { studentId: 1, assessmentId: 1, grade: 90 },
          { studentId: 1, assessmentId: 2, grade: 100 },
        ],
      }),
    ).toBeCloseTo(0.9);
  });
});

describe('breakdown - exclusion', () => {
  const bdAssessments = [
    { id: 1, tabId: 10, maxGrade: 100, title: 'A' },
    { id: 2, tabId: 10, maxGrade: 50, title: 'B', gradebookExcluded: true },
  ];

  it('flags excluded assessments and gives them zero points/effectiveWeight', () => {
    const [tab] = computeStudentBreakdown({
      studentId: 1,
      tabs: [{ id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 }],
      assessments: bdAssessments,
      submissions: [{ studentId: 1, assessmentId: 1, grade: 100 }],
    });
    const a = tab.assessments.find((x) => x.assessmentId === 1)!;
    const b = tab.assessments.find((x) => x.assessmentId === 2)!;
    expect(b.excluded).toBe(true);
    expect(b.points).toBe(0);
    expect(b.effectiveWeight).toBe(0);
    // equal effectiveWeight uses included count (1), so a gets the full 60
    expect(a.excluded).toBe(false);
    expect(a.effectiveWeight).toBeCloseTo(60);
    expect(a.points).toBeCloseTo(60);
  });
});

describe('zero-maxGrade assessments (0/0 must not produce NaN)', () => {
  it('equal mode: a graded 0/0 assessment contributes a 0 ratio, not NaN', () => {
    // a1 graded 0/0 → ratio 0 (not 0/0=NaN), a2 graded 50/50 → 1.0
    // subtotal = (0 + 1.0) / 2 = 0.5
    const zeroMax = [
      { id: 1, tabId: 10, maxGrade: 0, title: 'A' },
      { id: 2, tabId: 10, maxGrade: 50, title: 'B' },
    ];
    const result = computeTabSubtotal({
      studentId: 1,
      tab: { id: 10, title: 'M', categoryId: 0 },
      assessments: zeroMax,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 0 },
        { studentId: 1, assessmentId: 2, grade: 50 },
      ]),
    });
    expect(Number.isNaN(result)).toBe(false);
    expect(result).toBeCloseTo(0.5);
  });

  it('custom mode: a graded 0/0 assessment contributes 0, not NaN', () => {
    // a1 0/0 weight 30 → 0 points, a2 50/50 weight 70 → 70 points
    // subtotal = (0 + 70) / 100 = 0.7
    const zeroMax = [
      { id: 1, tabId: 10, maxGrade: 0, title: 'A', gradebookWeight: 30 },
      { id: 2, tabId: 10, maxGrade: 50, title: 'B', gradebookWeight: 70 },
    ];
    const result = computeTabSubtotal({
      studentId: 1,
      tab: {
        id: 10,
        title: 'M',
        categoryId: 0,
        gradebookWeight: 100,
        weightMode: 'custom' as const,
      },
      assessments: zeroMax,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 0 },
        { studentId: 1, assessmentId: 2, grade: 50 },
      ]),
    });
    expect(Number.isNaN(result)).toBe(false);
    expect(result).toBeCloseTo(0.7);
  });

  it('does not propagate NaN into the student total', () => {
    const zeroMax = [{ id: 1, tabId: 10, maxGrade: 0, title: 'A' }];
    const total = computeStudentTotal({
      studentId: 1,
      tabs: [{ id: 10, title: 'M', categoryId: 0, gradebookWeight: 100 }],
      assessments: zeroMax,
      submissions: subs([{ studentId: 1, assessmentId: 1, grade: 0 }]),
    });
    expect(Number.isNaN(total)).toBe(false);
    expect(total).toBe(0);
  });

  it('breakdown: a graded 0/0 assessment has 0 points/ratio, not NaN', () => {
    const zeroMax = [{ id: 1, tabId: 10, maxGrade: 0, title: 'A' }];
    const [tab] = computeStudentBreakdown({
      studentId: 1,
      tabs: [{ id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 }],
      assessments: zeroMax,
      submissions: subs([{ studentId: 1, assessmentId: 1, grade: 0 }]),
    });
    const a = tab.assessments.find((x) => x.assessmentId === 1)!;
    expect(Number.isNaN(a.points)).toBe(false);
    expect(a.points).toBe(0);
  });
});

const lc = (
  over: Partial<LevelContributionData> = {},
): LevelContributionData => ({
  enabled: true,
  formula: 'level / 30 * 8', // cap baked in literally - no maxLevel variable
  weight: 8,
  show: false,
  clamp: true,
  ...over,
});

describe('computeStudentBreakdown - level/external synthetic-id collision', () => {
  // An external assessment whose primary key is 1 is rendered as a negative-id
  // pseudo-tab (synthetic_tab_id = -id = -1), with its assessment id likewise
  // negated (-1). The Level-contribution row historically also used -1 for both
  // its tabId and assessmentId, so the two collided: indistinguishable by tabId
  // and producing duplicate `bd-<student>--1--1` React keys/testids.
  it('keeps the level row distinct from external assessment #1', () => {
    // External #1 as a pseudo-tab: tabId -1, single assessment id -1.
    const externalTab = {
      id: -1,
      title: 'Midterm (external)',
      categoryId: 99,
      gradebookWeight: 20,
    };
    const externalAssessment = {
      id: -1,
      tabId: -1,
      maxGrade: 100,
      title: 'Midterm (external)',
    };

    const breakdown = computeStudentBreakdown({
      studentId: 1,
      tabs: [externalTab],
      assessments: [externalAssessment],
      submissions: subs([{ studentId: 1, assessmentId: -1, grade: 90 }]),
      level: 15,
      levelContribution: lc(), // enabled: true
      levelContributionPoints: 4, // non-null → the level row is pushed
      courseMaxLevel: 30,
    });

    // One external pseudo-tab row + one level row = two DISTINCT rows.
    expect(breakdown).toHaveLength(2);

    // The LEVEL_TAB_ID filter must select exactly the level row — and only it.
    const levelRows = breakdown.filter((tb) => tb.tabId === LEVEL_TAB_ID);
    expect(levelRows).toHaveLength(1);
    expect(levelRows[0].assessments[0].title).toBe('Level');

    // The external row must NOT be classified as the level row.
    const externalRow = breakdown.find(
      (tb) => tb.assessments[0]?.title === 'Midterm (external)',
    )!;
    expect(externalRow.tabId).not.toBe(LEVEL_TAB_ID);

    // Row identity keys `${tabId}-${assessmentId}` must be unique (no dup React keys).
    const keys = breakdown.map(
      (tb) => `${tb.tabId}-${tb.assessments[0].assessmentId}`,
    );
    expect(new Set(keys).size).toBe(2);
  });
});

describe('computeWeightedRows - level contribution', () => {
  const baseStudent = {
    id: 1,
    name: 'A',
    email: 'a@x',
    externalId: null,
    level: 15,
    totalXp: 0,
  };

  it('reads levelContribution from the student object', () => {
    const rows = computeWeightedRows({
      students: [{ ...baseStudent, levelContribution: 4 }],
      tabs: [],
      assessments: [],
      submissions: [],
    });
    expect(rows[0].levelContribution).toBeCloseTo(4);
    expect(rows[0].total).toBeCloseTo(4);
  });

  it('contributes null when the student levelContribution is null', () => {
    const rows = computeWeightedRows({
      students: [{ ...baseStudent, levelContribution: null }],
      tabs: [],
      assessments: [],
      submissions: [],
    });
    expect(rows[0].levelContribution).toBeNull();
    expect(rows[0].total).toBeNull();
  });

  it('treats levelContribution as null when showLevelContribution is false', () => {
    const rows = computeWeightedRows({
      students: [{ ...baseStudent, levelContribution: 4 }],
      tabs: [],
      assessments: [],
      submissions: [],
      showLevelContribution: false,
    });
    expect(rows[0].levelContribution).toBeNull();
    expect(rows[0].total).toBeNull();
  });

  it('carries level from student regardless of showLevelContribution', () => {
    const rows = computeWeightedRows({
      students: [{ ...baseStudent, levelContribution: null }],
      tabs: [],
      assessments: [],
      submissions: [],
    });
    expect(rows[0].level).toBe(15);
  });
});

describe('levelOutOfRange', () => {
  it('flags a student whose contribution exceeds the weight', () => {
    const parsed = parseFormula('level'); // raw level as points
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(
        levelOutOfRange(
          [{ level: 50 }],
          lc({ formula: 'level', weight: 8 }),
          parsed,
        ),
      ).toBe(true);
      expect(
        levelOutOfRange(
          [{ level: 5 }],
          lc({ formula: 'level', weight: 8 }),
          parsed,
        ),
      ).toBe(false);
    }
  });
});

describe('levelOffenders', () => {
  const A = { id: 1, name: 'A', level: 5 };
  const B = { id: 2, name: 'B', level: 12 };
  const C = { id: 3, name: 'C', level: 3 };

  it('returns no offenders when the formula does not parse', () => {
    const parsed = parseFormula('level /');
    expect(levelOffenders([A], parsed, 10)).toEqual({
      below: [],
      above: [],
      unscoreable: [],
    });
  });

  it('returns no offenders when every contribution is within [0, max]', () => {
    const parsed = parseFormula('level * 0.1'); // 0.5, 1.2 - within [0, 10]
    if (!parsed.ok) throw new Error('expected ok');
    expect(levelOffenders([A, B], parsed, 10)).toEqual({
      below: [],
      above: [],
      unscoreable: [],
    });
  });

  it('lists students above the max, most extreme first', () => {
    const parsed = parseFormula('level * 5'); // A 25, B 60, C 15
    if (!parsed.ok) throw new Error('expected ok');
    const { above, below } = levelOffenders([A, B, C], parsed, 10);
    expect(below).toEqual([]);
    expect(above.map((o) => o.name)).toEqual(['B', 'A', 'C']);
    expect(above[0]).toMatchObject({ id: 2, name: 'B', value: 60 });
  });

  it('lists students below 0, most negative first', () => {
    const parsed = parseFormula('level - 8'); // A -3, B 4, C -5
    if (!parsed.ok) throw new Error('expected ok');
    const { above, below } = levelOffenders([A, B, C], parsed, 10);
    expect(above).toEqual([]);
    expect(below.map((o) => o.name)).toEqual(['C', 'A']);
    expect(below[0]).toMatchObject({ id: 3, name: 'C', value: -5 });
  });

  it('splits offenders across both bounds', () => {
    const parsed = parseFormula('level * 5 - 30'); // A -5, B 30
    if (!parsed.ok) throw new Error('expected ok');
    const { above, below } = levelOffenders([A, B], parsed, 10);
    expect(below.map((o) => o.value)).toEqual([-5]);
    expect(above.map((o) => o.value)).toEqual([30]);
  });
});

describe('computeStudentBreakdown - level', () => {
  it('appends a synthetic Level entry when enabled with pre-computed points', () => {
    const breakdown = computeStudentBreakdown({
      studentId: 1,
      tabs: [],
      assessments: [],
      submissions: [],
      level: 15,
      levelContribution: lc(),
      levelContributionPoints: 4, // pre-computed: 15/30*8=4
    });
    const levelTab = breakdown.find((tb) => tb.tabId === LEVEL_TAB_ID);
    expect(levelTab).toBeDefined();
    expect(levelTab!.assessments[0].title).toBe('Level');
    expect(levelTab!.assessments[0].points).toBeCloseTo(4);
    expect(levelTab!.assessments[0].effectiveWeight).toBe(8);
  });

  it('omits the Level entry when disabled', () => {
    const breakdown = computeStudentBreakdown({
      studentId: 1,
      tabs: [],
      assessments: [],
      submissions: [],
      level: 15,
      levelContribution: lc({ enabled: false }),
      levelContributionPoints: null,
    });
    expect(breakdown.find((tb) => tb.tabId === LEVEL_TAB_ID)).toBeUndefined();
  });

  it('omits the Level entry when levelContributionPoints is null (even if enabled)', () => {
    const breakdown = computeStudentBreakdown({
      studentId: 1,
      tabs: [],
      assessments: [],
      submissions: [],
      level: 15,
      levelContribution: lc(),
      levelContributionPoints: null,
    });
    expect(breakdown.find((tb) => tb.tabId === LEVEL_TAB_ID)).toBeUndefined();
  });
});

describe('levelOffenders unscoreable bucket', () => {
  const students = [
    { id: 1, name: 'Ann', level: 0 },
    { id: 2, name: 'Bob', level: 5 },
    { id: 3, name: 'Cy', level: 10 },
  ];

  it('collects students whose contribution is NaN (divide-by-zero)', () => {
    const parsed = parseFormula('100 / level'); // level 0 -> NaN
    const r = levelOffenders(students, parsed, 50);
    expect(r.unscoreable.map((o) => o.id)).toEqual([1]);
    expect(r.unscoreable[0].level).toBe(0);
    expect(r.below).toHaveLength(0);
    expect(r.above).toHaveLength(0);
  });

  it('is empty when no student divides by zero', () => {
    const parsed = parseFormula('level');
    expect(levelOffenders(students, parsed, 50).unscoreable).toHaveLength(0);
  });

  it('sorts unscoreable by level ascending', () => {
    const parsed = parseFormula('100 / (level - 5)'); // NaN at level 5 only
    const many = [
      { id: 1, name: 'Zoe', level: 5 },
      { id: 2, name: 'Amy', level: 5 },
    ];
    const r = levelOffenders(many, parsed, 50);
    expect(r.unscoreable.map((o) => o.name)).toEqual(['Amy', 'Zoe']);
  });
});

// ---------------------------------------------------------------------------
// keep-N (keepHighest) — equal mode only
// ---------------------------------------------------------------------------

// Three equal-mode assessments: a1=60/100=0.60, a2=80/100=0.80, a3=100/100=1.00
// keepHighest:1 → keep top 1 (a3, ratio 1.0), drop a1 and a2
const dropConfig = {
  tab: {
    id: 10,
    title: 'Tab',
    categoryId: 0,
    gradebookWeight: 60,
    keepHighest: 1,
  },
  assessments: [
    { id: 1, tabId: 10, maxGrade: 100, title: 'A' },
    { id: 2, tabId: 10, maxGrade: 100, title: 'B' },
    { id: 3, tabId: 10, maxGrade: 100, title: 'C' },
  ],
  submissions: subs([
    { studentId: 1, assessmentId: 1, grade: 60 },
    { studentId: 1, assessmentId: 2, grade: 80 },
    { studentId: 1, assessmentId: 3, grade: 100 },
  ]),
};

describe('equalSubtotal — keepHighest via computeTabSubtotal', () => {
  it('keepHighest=0 (unset): keeps all assessments — same as default behavior', () => {
    // (0.6 + 0.8 + 1.0) / 3 = 0.8
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { id: 10, title: 'Tab', categoryId: 0, gradebookWeight: 60 },
        assessments: dropConfig.assessments,
        submissions: dropConfig.submissions,
      }),
    ).toBeCloseTo(0.8);
  });

  it('keepHighest=1: averages only the single highest ratio', () => {
    // top 1: a3 ratio=1.0 → subtotal = 1.0/1 = 1.0
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: dropConfig.tab,
        assessments: dropConfig.assessments,
        submissions: dropConfig.submissions,
      }),
    ).toBeCloseTo(1.0);
  });

  it('keepHighest > count: clamps to all assessments', () => {
    // keepHighest=99 with 3 assessments → keep all 3 → (0.6+0.8+1.0)/3 = 0.8
    expect(
      computeTabSubtotal({
        studentId: 1,
        tab: { ...dropConfig.tab, keepHighest: 99 },
        assessments: dropConfig.assessments,
        submissions: dropConfig.submissions,
      }),
    ).toBeCloseTo(0.8);
  });
});

describe('computeStudentBreakdown — keepHighest', () => {
  it('dropped flag is true on lowest-ratio assessments, false on kept ones', () => {
    const [tab] = computeStudentBreakdown({
      studentId: 1,
      tabs: [dropConfig.tab],
      assessments: dropConfig.assessments,
      submissions: dropConfig.submissions,
    });
    const a1 = tab.assessments.find((x) => x.assessmentId === 1)!; // ratio 0.60 — dropped
    const a2 = tab.assessments.find((x) => x.assessmentId === 2)!; // ratio 0.80 — dropped
    const a3 = tab.assessments.find((x) => x.assessmentId === 3)!; // ratio 1.00 — kept

    expect(a1.dropped).toBe(true);
    expect(a2.dropped).toBe(true);
    expect(a3.dropped).toBe(false);
  });

  it('dropped assessment has points=0 and effectiveWeight=0', () => {
    const [tab] = computeStudentBreakdown({
      studentId: 1,
      tabs: [dropConfig.tab],
      assessments: dropConfig.assessments,
      submissions: dropConfig.submissions,
    });
    const a1 = tab.assessments.find((x) => x.assessmentId === 1)!;
    const a2 = tab.assessments.find((x) => x.assessmentId === 2)!;

    expect(a1.points).toBe(0);
    expect(a1.effectiveWeight).toBe(0);
    expect(a2.points).toBe(0);
    expect(a2.effectiveWeight).toBe(0);
  });

  it('kept assessment points/effectiveWeight are computed over keptCount=1', () => {
    // tab weight=60, keptCount=1 → effectiveWeight=60/1=60; ratio=1.0 → points=(1.0/1)*60=60
    const [tab] = computeStudentBreakdown({
      studentId: 1,
      tabs: [dropConfig.tab],
      assessments: dropConfig.assessments,
      submissions: dropConfig.submissions,
    });
    const a3 = tab.assessments.find((x) => x.assessmentId === 3)!;

    expect(a3.effectiveWeight).toBeCloseTo(60);
    expect(a3.points).toBeCloseTo(60);
  });

  it('excluded=false and dropped=false on kept assessment', () => {
    const [tab] = computeStudentBreakdown({
      studentId: 1,
      tabs: [dropConfig.tab],
      assessments: dropConfig.assessments,
      submissions: dropConfig.submissions,
    });
    const a3 = tab.assessments.find((x) => x.assessmentId === 3)!;
    expect(a3.excluded).toBe(false);
    expect(a3.dropped).toBe(false);
  });

  it('no keepHighest (0): dropped=false for all assessments', () => {
    const [tab] = computeStudentBreakdown({
      studentId: 1,
      tabs: [{ id: 10, title: 'Tab', categoryId: 0, gradebookWeight: 60 }],
      assessments: dropConfig.assessments,
      submissions: dropConfig.submissions,
    });
    tab.assessments.forEach((a) => expect(a.dropped).toBe(false));
  });

  it('tie-break: equal ratios → lower id is dropped first', () => {
    // a1 (id=1) and a2 (id=2) both have ratio 0.5; keepHighest=1.
    // Tie-break ascending by id → a1 is ranked lower → a1 is dropped; a2 is kept.
    const tieAssessments = [
      { id: 1, tabId: 10, maxGrade: 100, title: 'A' },
      { id: 2, tabId: 10, maxGrade: 100, title: 'B' },
    ];
    const [tab] = computeStudentBreakdown({
      studentId: 1,
      tabs: [
        {
          id: 10,
          title: 'Tab',
          categoryId: 0,
          gradebookWeight: 60,
          keepHighest: 1,
        },
      ],
      assessments: tieAssessments,
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 50 },
        { studentId: 1, assessmentId: 2, grade: 50 },
      ]),
    });
    const a1 = tab.assessments.find((x) => x.assessmentId === 1)!;
    const a2 = tab.assessments.find((x) => x.assessmentId === 2)!;
    expect(a1.dropped).toBe(true); // lower id dropped
    expect(a2.dropped).toBe(false); // higher id kept
  });
});

describe('computeWeightedRows — keepHighest', () => {
  const keepStudent = [
    {
      id: 1,
      name: 'Alice',
      email: 'alice@e.com',
      externalId: null,
      level: 1,
      totalXp: 0,
      levelContribution: null,
    },
  ];

  it('subtotal for tab with keepHighest=1 equals average of the single top ratio', () => {
    // top ratio among a1,a2,a3 = 1.0; subtotal = 1.0
    const rows = computeWeightedRows({
      students: keepStudent,
      tabs: [dropConfig.tab],
      assessments: dropConfig.assessments,
      submissions: dropConfig.submissions,
    });
    expect(rows[0].subtotals[0]).toBeCloseTo(1.0);
  });

  it('total reflects keepHighest subtotal multiplied by tab weight', () => {
    // subtotal=1.0, tabWeight=60 → total=60
    const rows = computeWeightedRows({
      students: keepStudent,
      tabs: [dropConfig.tab],
      assessments: dropConfig.assessments,
      submissions: dropConfig.submissions,
    });
    expect(rows[0].total).toBeCloseTo(60);
  });
});

describe('external-assessment grade bounding (floorAtZero / capAtMaximum)', () => {
  it('equal mode: capAtMaximum clamps an over-max grade before ratioing', () => {
    // a1 graded 120/100 with capAtMaximum → effective 100 → ratio 1.0 (not 1.2)
    // a2 graded 25/50 → 0.5 ; subtotal = (1.0 + 0.5)/2 = 0.75
    const result = computeTabSubtotal({
      studentId: 1,
      tab: { id: 10, title: 'M', categoryId: 0 },
      assessments: [
        { id: 1, tabId: 10, maxGrade: 100, title: 'A', capAtMaximum: true },
        { id: 2, tabId: 10, maxGrade: 50, title: 'B' },
      ],
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 120 },
        { studentId: 1, assessmentId: 2, grade: 25 },
      ]),
    });
    expect(result).toBeCloseTo(0.75);
  });

  it('equal mode: floorAtZero clamps a negative grade to 0 before ratioing', () => {
    // a1 graded -40/100 with floorAtZero → effective 0 → ratio 0 (not -0.4)
    // a2 graded 50/50 → 1.0 ; subtotal = (0 + 1.0)/2 = 0.5
    const result = computeTabSubtotal({
      studentId: 1,
      tab: { id: 10, title: 'M', categoryId: 0 },
      assessments: [
        { id: 1, tabId: 10, maxGrade: 100, title: 'A', floorAtZero: true },
        { id: 2, tabId: 10, maxGrade: 50, title: 'B' },
      ],
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: -40 },
        { studentId: 1, assessmentId: 2, grade: 50 },
      ]),
    });
    expect(result).toBeCloseTo(0.5);
  });

  it('native assessment (no flags) passes an over-max grade through uncapped', () => {
    // a1 graded 120/100, no capAtMaximum → ratio 1.2 (native behaviour unchanged)
    const result = computeTabSubtotal({
      studentId: 1,
      tab: { id: 10, title: 'M', categoryId: 0 },
      assessments: [{ id: 1, tabId: 10, maxGrade: 100, title: 'A' }],
      submissions: subs([{ studentId: 1, assessmentId: 1, grade: 120 }]),
    });
    expect(result).toBeCloseTo(1.2);
  });

  it('custom mode: bounds the grade before applying the assessment weight', () => {
    // a1 120/100 capAtMaximum weight 70 → effective 100 → 1.0*70 = 70
    // a2 50/50 weight 30 → 1.0*30 = 30 ; subtotal = (70 + 30)/100 = 1.0
    const result = computeTabSubtotal({
      studentId: 1,
      tab: {
        id: 10,
        title: 'M',
        categoryId: 0,
        gradebookWeight: 100,
        weightMode: 'custom' as const,
      },
      assessments: [
        {
          id: 1,
          tabId: 10,
          maxGrade: 100,
          title: 'A',
          gradebookWeight: 70,
          capAtMaximum: true,
        },
        { id: 2, tabId: 10, maxGrade: 50, title: 'B', gradebookWeight: 30 },
      ],
      submissions: subs([
        { studentId: 1, assessmentId: 1, grade: 120 },
        { studentId: 1, assessmentId: 2, grade: 50 },
      ]),
    });
    expect(result).toBeCloseTo(1.0);
  });

  it('breakdown: ratio/points reflect the bounded grade while grade stays raw', () => {
    // a1 120/100 capAtMaximum, equal mode, n=1, tab weight 60
    //   effective 100 → ratio 1.0 → points = (1.0/1)*60 = 60
    //   raw grade preserved for the "120/100" display
    const [tab] = computeStudentBreakdown({
      studentId: 1,
      tabs: [{ id: 10, title: 'M', categoryId: 0, gradebookWeight: 60 }],
      assessments: [
        { id: 1, tabId: 10, maxGrade: 100, title: 'A', capAtMaximum: true },
      ],
      submissions: subs([{ studentId: 1, assessmentId: 1, grade: 120 }]),
    });
    const a = tab.assessments.find((x) => x.assessmentId === 1)!;
    expect(a.grade).toBe(120); // raw, for display
    expect(a.ratio).toBeCloseTo(1.0); // bounded fraction earned
    expect(a.points).toBeCloseTo(60);
  });
});
