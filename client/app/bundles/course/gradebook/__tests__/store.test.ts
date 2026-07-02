import reducer, { actions } from '../store';

const EXTERNAL_ASSESSMENTS = 'External Assessments';

const baseState = {
  categories: [],
  tabs: [
    { id: 1, title: 'T1', categoryId: 1, gradebookWeight: 50 },
    { id: 2, title: 'T2', categoryId: 1, gradebookWeight: 50 },
  ],
  assessments: [
    { id: 101, title: 'A1', tabId: 1, maxGrade: 100 },
    { id: 102, title: 'A2', tabId: 1, maxGrade: 100 },
  ],
  students: [],
  submissions: [],
  gamificationEnabled: false,
  weightedViewEnabled: false,
  canManageWeights: false,
  courseMaxLevel: 0,
  levelContribution: {
    enabled: false,
    formula: '',
    weight: 0,
    show: false,
    clamp: true,
  },
};

describe('SAVE_GRADEBOOK reducer', () => {
  it('returns the initial state for an unknown action', () => {
    const next = reducer(undefined, { type: 'unknown' } as never);
    expect(next).toEqual({
      categories: [],
      tabs: [],
      assessments: [],
      students: [],
      submissions: [],
      gamificationEnabled: false,
      weightedViewEnabled: false,
      canManageWeights: false,
      courseMaxLevel: 0,
      levelContribution: {
        enabled: false,
        formula: '',
        weight: 0,
        show: false,
        clamp: true,
      },
    });
  });

  it('hydrates every field from the payload', () => {
    const next = reducer(
      undefined,
      actions.saveGradebook({
        categories: [{ id: 1, title: 'C' }],
        tabs: [{ id: 10, title: 'T', categoryId: 1, gradebookWeight: 50 }],
        assessments: [{ id: 100, title: 'A', tabId: 10, maxGrade: 100 }],
        students: [],
        submissions: [{ studentId: 1, assessmentId: 100, grade: 8 }],
        gamificationEnabled: true,
        weightedViewEnabled: true,
        canManageWeights: true,
        courseMaxLevel: 0,
        levelContribution: {
          enabled: false,
          formula: '',
          weight: 0,
          show: false,
          clamp: true,
        },
      }),
    );
    expect(next.categories).toHaveLength(1);
    expect(next.tabs[0].gradebookWeight).toBe(50);
    expect(next.assessments[0].id).toBe(100);
    expect(next.submissions[0].grade).toBe(8);
    expect(next.gamificationEnabled).toBe(true);
    expect(next.weightedViewEnabled).toBe(true);
    expect(next.canManageWeights).toBe(true);
  });
});

describe('UPDATE_TAB_WEIGHTS reducer', () => {
  it('updates gradebookWeight and weightMode for the matching tab', () => {
    const next = reducer(
      baseState,
      actions.updateTabWeights({
        weights: [{ tabId: 1, weight: 80, weightMode: 'equal' }],
      }),
    );
    expect(next.tabs.find((t) => t.id === 1)?.gradebookWeight).toBe(80);
    expect(next.tabs.find((t) => t.id === 1)?.weightMode).toBe('equal');
    expect(next.tabs.find((t) => t.id === 2)?.gradebookWeight).toBe(50);
  });

  it('does not set any excluded field in tabs', () => {
    const next = reducer(
      baseState,
      actions.updateTabWeights({
        weights: [{ tabId: 1, weight: 0, weightMode: 'equal' }],
      }),
    );
    const tab = next.tabs.find((t) => t.id === 1)!;
    expect(tab).not.toHaveProperty('gradebookExcluded');
  });

  it('updates multiple tabs in one action', () => {
    const next = reducer(
      baseState,
      actions.updateTabWeights({
        weights: [
          { tabId: 1, weight: 30, weightMode: 'equal' },
          { tabId: 2, weight: 70, weightMode: 'custom' },
        ],
      }),
    );
    expect(next.tabs.find((t) => t.id === 1)?.gradebookWeight).toBe(30);
    expect(next.tabs.find((t) => t.id === 2)?.gradebookWeight).toBe(70);
    expect(next.tabs.find((t) => t.id === 2)?.weightMode).toBe('custom');
  });

  it('applies per-assessment weights for custom mode', () => {
    const next = reducer(
      baseState,
      actions.updateTabWeights({
        weights: [
          {
            tabId: 1,
            weight: 100,
            weightMode: 'custom',
            assessmentWeights: [
              { assessmentId: 101, weight: 30 },
              { assessmentId: 102, weight: 70 },
            ],
          },
        ],
      }),
    );
    expect(next.assessments.find((a) => a.id === 101)?.gradebookWeight).toBe(
      30,
    );
    expect(next.assessments.find((a) => a.id === 102)?.gradebookWeight).toBe(
      70,
    );
  });

  it('clears per-assessment weights for equal mode', () => {
    const stateWithWeights = {
      ...baseState,
      assessments: [
        { id: 101, title: 'A1', tabId: 1, maxGrade: 100, gradebookWeight: 30 },
        { id: 102, title: 'A2', tabId: 1, maxGrade: 100, gradebookWeight: 70 },
      ],
    };
    const next = reducer(
      stateWithWeights,
      actions.updateTabWeights({
        weights: [{ tabId: 1, weight: 100, weightMode: 'equal' }],
      }),
    );
    expect(
      next.assessments.find((a) => a.id === 101)?.gradebookWeight,
    ).toBeNull();
    expect(
      next.assessments.find((a) => a.id === 102)?.gradebookWeight,
    ).toBeNull();
  });

  it('applies per-assessment exclusion flips from the payload', () => {
    const start = reducer(
      undefined,
      actions.saveGradebook({
        categories: [{ id: 1, title: 'C' }],
        tabs: [
          {
            id: 10,
            title: 'T',
            categoryId: 1,
            gradebookWeight: 50,
            weightMode: 'equal',
          },
        ],
        assessments: [
          { id: 101, title: 'A', tabId: 10, maxGrade: 100 },
          { id: 102, title: 'B', tabId: 10, maxGrade: 100 },
        ],
        students: [],
        submissions: [],
        gamificationEnabled: false,
        weightedViewEnabled: true,
        canManageWeights: true,
        courseMaxLevel: 0,
        levelContribution: {
          enabled: false,
          formula: '',
          weight: 0,
          show: false,
          clamp: true,
        },
      }),
    );

    const next = reducer(
      start,
      actions.updateTabWeights({
        weights: [
          {
            tabId: 10,
            weight: 50,
            weightMode: 'equal',
            excludedAssessmentIds: [101],
          },
        ],
      }),
    );

    expect(next.assessments.find((a) => a.id === 101)!.gradebookExcluded).toBe(
      true,
    );
    expect(next.assessments.find((a) => a.id === 102)!.gradebookExcluded).toBe(
      false,
    );
  });

  it('clears assessment exclusion when excludedAssessmentIds is omitted', () => {
    const seeded = {
      ...baseState,
      assessments: [
        {
          id: 101,
          title: 'A1',
          tabId: 1,
          maxGrade: 100,
          gradebookExcluded: true,
        },
        {
          id: 102,
          title: 'A2',
          tabId: 1,
          maxGrade: 100,
          gradebookExcluded: true,
        },
      ],
    };
    const next = reducer(
      seeded,
      actions.updateTabWeights({
        weights: [{ tabId: 1, weight: 50, weightMode: 'equal' }],
      }),
    );
    expect(next.assessments.find((a) => a.id === 101)?.gradebookExcluded).toBe(
      false,
    );
    expect(next.assessments.find((a) => a.id === 102)?.gradebookExcluded).toBe(
      false,
    );
  });
});

describe('level contribution', () => {
  it('stores levelContribution and courseMaxLevel on SAVE_GRADEBOOK', () => {
    const data = {
      categories: [],
      tabs: [],
      assessments: [],
      students: [],
      submissions: [],
      gamificationEnabled: true,
      weightedViewEnabled: true,
      canManageWeights: true,
      courseMaxLevel: 20,
      levelContribution: {
        enabled: true,
        formula: 'level / 20 * 8',
        weight: 8,
        show: true,
        clamp: true,
      },
    };
    const next = reducer(undefined, actions.saveGradebook(data));
    expect(next.courseMaxLevel).toBe(20);
    expect(next.levelContribution.enabled).toBe(true);
    expect(next.levelContribution.weight).toBe(8);
  });

  it('applies an echoed levelContribution on UPDATE_TAB_WEIGHTS', () => {
    const next = reducer(
      undefined,
      actions.updateTabWeights({
        weights: [],
        levelContribution: {
          enabled: true,
          formula: 'level',
          formulaAst: null,
          weight: 5,
          show: false,
          clamp: true,
        },
      }),
    );
    expect(next.levelContribution.enabled).toBe(true);
    expect(next.levelContribution.weight).toBe(5);
  });

  it('recomputes student levelContribution from formulaAst when enabled', () => {
    const stateWithStudents = reducer(
      undefined,
      actions.saveGradebook({
        categories: [],
        tabs: [],
        assessments: [],
        students: [
          {
            id: 1,
            name: 'A',
            email: 'a@x',
            externalId: null,
            level: 10,
            totalXp: 0,
            levelContribution: null,
          },
          {
            id: 2,
            name: 'B',
            email: 'b@x',
            externalId: null,
            level: 20,
            totalXp: 0,
            levelContribution: null,
          },
        ],
        submissions: [],
        gamificationEnabled: true,
        weightedViewEnabled: true,
        canManageWeights: true,
        courseMaxLevel: 30,
        levelContribution: {
          enabled: false,
          formula: '',
          weight: 0,
          show: false,
          clamp: true,
        },
      }),
    );
    // formula: 'level * 0.5' → AST: binop(*) [var(level), num(0.5)]
    const formulaAst = {
      type: 'binop' as const,
      op: '*' as const,
      left: { type: 'var' as const, name: 'level' as const },
      right: { type: 'num' as const, value: 0.5 },
    };
    const next = reducer(
      stateWithStudents,
      actions.updateTabWeights({
        weights: [],
        levelContribution: {
          enabled: true,
          formula: 'level * 0.5',
          formulaAst,
          weight: 15,
          show: false,
          clamp: true,
        },
      }),
    );
    expect(next.students[0].levelContribution).toBeCloseTo(5); // 10 * 0.5
    expect(next.students[1].levelContribution).toBeCloseTo(10); // 20 * 0.5
  });

  it('clamps recomputed levelContribution to [0, weight] when clamp is on', () => {
    const stateWithStudents = reducer(
      undefined,
      actions.saveGradebook({
        categories: [],
        tabs: [],
        assessments: [],
        students: [
          {
            id: 1,
            name: 'A',
            email: 'a@x',
            externalId: null,
            level: 10,
            totalXp: 0,
            levelContribution: null,
          },
          {
            id: 2,
            name: 'B',
            email: 'b@x',
            externalId: null,
            level: 20,
            totalXp: 0,
            levelContribution: null,
          },
        ],
        submissions: [],
        gamificationEnabled: true,
        weightedViewEnabled: true,
        canManageWeights: true,
        courseMaxLevel: 30,
        levelContribution: {
          enabled: false,
          formula: '',
          weight: 0,
          show: false,
          clamp: true,
        },
      }),
    );
    // formula: 'level + 5' → AST: binop(+) [var(level), num(5)]
    const formulaAst = {
      type: 'binop' as const,
      op: '+' as const,
      left: { type: 'var' as const, name: 'level' as const },
      right: { type: 'num' as const, value: 5 },
    };
    const next = reducer(
      stateWithStudents,
      actions.updateTabWeights({
        weights: [],
        levelContribution: {
          enabled: true,
          formula: 'level + 5',
          formulaAst,
          weight: 12,
          show: false,
          clamp: true,
        },
      }),
    );
    // raw 10 + 5 = 15 → clamped to weight 12; raw 20 + 5 = 25 → clamped to 12
    expect(next.students[0].levelContribution).toBeCloseTo(12);
    expect(next.students[1].levelContribution).toBeCloseTo(12);
  });

  it('leaves recomputed levelContribution unclamped when clamp is off', () => {
    const stateWithStudents = reducer(
      undefined,
      actions.saveGradebook({
        categories: [],
        tabs: [],
        assessments: [],
        students: [
          {
            id: 1,
            name: 'A',
            email: 'a@x',
            externalId: null,
            level: 10,
            totalXp: 0,
            levelContribution: null,
          },
        ],
        submissions: [],
        gamificationEnabled: true,
        weightedViewEnabled: true,
        canManageWeights: true,
        courseMaxLevel: 30,
        levelContribution: {
          enabled: false,
          formula: '',
          weight: 0,
          show: false,
          clamp: true,
        },
      }),
    );
    const formulaAst = {
      type: 'binop' as const,
      op: '+' as const,
      left: { type: 'var' as const, name: 'level' as const },
      right: { type: 'num' as const, value: 5 },
    };
    const next = reducer(
      stateWithStudents,
      actions.updateTabWeights({
        weights: [],
        levelContribution: {
          enabled: true,
          formula: 'level + 5',
          formulaAst,
          weight: 12,
          show: false,
          clamp: false,
        },
      }),
    );
    // clamp off → raw 10 + 5 = 15 kept as-is
    expect(next.students[0].levelContribution).toBeCloseTo(15);
  });

  it('sets all students levelContribution to null when level contribution disabled', () => {
    const stateWithStudents = reducer(
      undefined,
      actions.saveGradebook({
        categories: [],
        tabs: [],
        assessments: [],
        students: [
          {
            id: 1,
            name: 'A',
            email: 'a@x',
            externalId: null,
            level: 10,
            totalXp: 0,
            levelContribution: 5,
          },
        ],
        submissions: [],
        gamificationEnabled: true,
        weightedViewEnabled: true,
        canManageWeights: true,
        courseMaxLevel: 30,
        levelContribution: {
          enabled: true,
          formula: 'level * 0.5',
          weight: 15,
          show: false,
          clamp: true,
        },
      }),
    );
    const next = reducer(
      stateWithStudents,
      actions.updateTabWeights({
        weights: [],
        levelContribution: {
          enabled: false,
          formula: '',
          formulaAst: null,
          weight: 0,
          show: false,
          clamp: true,
        },
      }),
    );
    expect(next.students[0].levelContribution).toBeNull();
  });
});

describe('UPDATE_TAB_WEIGHTS — keepHighest', () => {
  it('writes keepHighest onto the matching tab', () => {
    const state = {
      ...baseState,
      tabs: [{ id: 10, title: 'T', categoryId: 1, gradebookWeight: 50 }],
    };
    const next = reducer(
      state,
      actions.updateTabWeights({
        weights: [{ tabId: 10, weight: 50, keepHighest: 2 }],
      }),
    );
    expect(next.tabs[0].keepHighest).toBe(2);
  });

  it('defaults keepHighest to 0 when omitted from the payload', () => {
    const state = {
      ...baseState,
      tabs: [
        {
          id: 10,
          title: 'T',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 3,
        },
      ],
    };
    const next = reducer(
      state,
      actions.updateTabWeights({
        weights: [{ tabId: 10, weight: 50 }],
      }),
    );
    expect(next.tabs[0].keepHighest).toBe(0);
  });

  it('does not modify keepHighest on other tabs', () => {
    const state = {
      ...baseState,
      tabs: [
        {
          id: 10,
          title: 'T1',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 1,
        },
        {
          id: 11,
          title: 'T2',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 2,
        },
      ],
    };
    const next = reducer(
      state,
      actions.updateTabWeights({
        weights: [{ tabId: 10, weight: 50, keepHighest: 5 }],
      }),
    );
    expect(next.tabs[1].keepHighest).toBe(2);
  });
});

describe('external assessment reducers', () => {
  const state = {
    categories: [{ id: 1, title: 'Cat A' }],
    tabs: [{ id: 10, title: 'Tab 1', categoryId: 1 }],
    assessments: [{ id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 }],
    students: [],
    submissions: [{ studentId: 1, assessmentId: 100, grade: 8 }],
    gamificationEnabled: false,
    userId: 0,
    weightedViewEnabled: false,
    canManageWeights: true,
    levelContribution: {
      enabled: false,
      formula: '',
      weight: 0,
      show: false,
      clamp: true,
    },
    courseMaxLevel: 0,
  };

  it('applyCreatedExternal adds category, tab and assessment', () => {
    const next = reducer(
      state,
      actions.applyCreatedExternal({
        assessment: {
          id: -5,
          title: 'Midterm',
          tabId: 200,
          maxGrade: 50,
          external: true,
        },
        tab: { id: 200, title: 'Midterm', categoryId: 2 },
        category: { id: 2, title: EXTERNAL_ASSESSMENTS },
      }),
    );
    expect(next.categories.find((c) => c.id === 2)?.title).toBe(
      EXTERNAL_ASSESSMENTS,
    );
    expect(next.tabs.find((t) => t.id === 200)?.title).toBe('Midterm');
    expect(next.assessments.find((a) => a.id === -5)?.external).toBe(true);
  });

  it('applyCreatedExternal does not duplicate existing category, tab, or assessment', () => {
    const seeded = {
      ...state,
      categories: [...state.categories, { id: 2, title: EXTERNAL_ASSESSMENTS }],
      tabs: [...state.tabs, { id: 200, title: 'Midterm', categoryId: 2 }],
    };
    const next = reducer(
      seeded,
      actions.applyCreatedExternal({
        assessment: {
          id: -6,
          title: 'Final',
          tabId: 200,
          maxGrade: 100,
          external: true,
        },
        tab: { id: 200, title: 'Midterm', categoryId: 2 },
        category: { id: 2, title: EXTERNAL_ASSESSMENTS },
      }),
    );
    expect(next.categories.filter((c) => c.id === 2)).toHaveLength(1);
    expect(next.tabs.filter((t) => t.id === 200)).toHaveLength(1);
    expect(next.assessments.filter((a) => a.id === -6)).toHaveLength(1);
  });

  it('updateExternalAssessment changes title and maxGrade and syncs tab title', () => {
    const seeded = {
      ...state,
      assessments: [
        ...state.assessments,
        { id: -5, title: 'Midterm', tabId: 200, maxGrade: 50, external: true },
      ],
      tabs: [...state.tabs, { id: 200, title: 'Midterm', categoryId: 2 }],
    };
    const next = reducer(
      seeded,
      actions.updateExternalAssessment({
        assessment: {
          id: -5,
          title: 'Midterm Exam',
          tabId: 200,
          maxGrade: 60,
          external: true,
        },
        tab: { id: 200, title: 'Midterm Exam', categoryId: 2 },
      }),
    );
    expect(next.assessments.find((a) => a.id === -5)?.title).toBe(
      'Midterm Exam',
    );
    expect(next.assessments.find((a) => a.id === -5)?.maxGrade).toBe(60);
    expect(next.tabs.find((t) => t.id === 200)?.title).toBe('Midterm Exam');
  });

  it('updateExternalAssessment writes tab.gradebookWeight when provided and preserves it when omitted', () => {
    const seeded = {
      ...state,
      assessments: [
        ...state.assessments,
        { id: -5, title: 'Midterm', tabId: 200, maxGrade: 50, external: true },
      ],
      tabs: [
        ...state.tabs,
        { id: 200, title: 'Midterm', categoryId: 2, gradebookWeight: 40 },
      ],
    };
    const withWeight = reducer(
      seeded,
      actions.updateExternalAssessment({
        assessment: {
          id: -5,
          title: 'M',
          tabId: 200,
          maxGrade: 50,
          external: true,
        },
        tab: { id: 200, title: 'M', categoryId: 2, gradebookWeight: 75 },
      }),
    );
    expect(withWeight.tabs.find((t) => t.id === 200)?.gradebookWeight).toBe(75);

    const noWeight = reducer(
      seeded,
      actions.updateExternalAssessment({
        assessment: {
          id: -5,
          title: 'M',
          tabId: 200,
          maxGrade: 50,
          external: true,
        },
        tab: { id: 200, title: 'M', categoryId: 2 },
      }),
    );
    expect(noWeight.tabs.find((t) => t.id === 200)?.gradebookWeight).toBe(40);
  });

  it('deleteExternalAssessment removes the assessment and its now-empty tab', () => {
    const seeded = {
      ...state,
      assessments: [
        ...state.assessments,
        { id: -5, title: 'Midterm', tabId: 200, maxGrade: 50, external: true },
      ],
      tabs: [...state.tabs, { id: 200, title: 'Midterm', categoryId: 2 }],
      submissions: [
        ...state.submissions,
        { studentId: 1, assessmentId: -5, grade: 30 },
      ],
    };
    const next = reducer(seeded, actions.deleteExternalAssessment(-5));
    expect(next.assessments.find((a) => a.id === -5)).toBeUndefined();
    expect(next.tabs.find((t) => t.id === 200)).toBeUndefined();
    expect(next.submissions.find((s) => s.assessmentId === -5)).toBeUndefined();
  });

  it('deleteExternalAssessment drops the synthetic category once its last external is gone', () => {
    const seeded = {
      ...state,
      categories: [...state.categories, { id: 2, title: EXTERNAL_ASSESSMENTS }],
      assessments: [
        ...state.assessments,
        { id: -5, title: 'Midterm', tabId: 200, maxGrade: 50, external: true },
      ],
      tabs: [...state.tabs, { id: 200, title: 'Midterm', categoryId: 2 }],
    };
    const next = reducer(seeded, actions.deleteExternalAssessment(-5));
    expect(next.categories.find((c) => c.id === 2)).toBeUndefined();
    expect(next.categories.find((c) => c.id === 1)).toBeDefined();
  });

  it('deleteExternalAssessment keeps the category while other externals remain', () => {
    const seeded = {
      ...state,
      categories: [...state.categories, { id: 2, title: EXTERNAL_ASSESSMENTS }],
      assessments: [
        ...state.assessments,
        { id: -5, title: 'Midterm', tabId: 200, maxGrade: 50, external: true },
        { id: -6, title: 'Final', tabId: 201, maxGrade: 100, external: true },
      ],
      tabs: [
        ...state.tabs,
        { id: 200, title: 'Midterm', categoryId: 2 },
        { id: 201, title: 'Final', categoryId: 2 },
      ],
    };
    const next = reducer(seeded, actions.deleteExternalAssessment(-5));
    expect(next.categories.find((c) => c.id === 2)).toBeDefined();
    expect(next.tabs.find((t) => t.id === 201)).toBeDefined();
  });

  it('setExternalGrade upserts a submission row by (studentId, assessmentId)', () => {
    const inserted = reducer(
      state,
      actions.setExternalGrade({ studentId: 1, assessmentId: -5, grade: 42 }),
    );
    expect(
      inserted.submissions.find(
        (s) => s.studentId === 1 && s.assessmentId === -5,
      )?.grade,
    ).toBe(42);

    const updated = reducer(
      inserted,
      actions.setExternalGrade({ studentId: 1, assessmentId: -5, grade: 17 }),
    );
    expect(
      updated.submissions.filter(
        (s) => s.studentId === 1 && s.assessmentId === -5,
      ),
    ).toHaveLength(1);
    expect(
      updated.submissions.find(
        (s) => s.studentId === 1 && s.assessmentId === -5,
      )?.grade,
    ).toBe(17);
  });

  it('setExternalGrade can clear a grade to null', () => {
    const next = reducer(
      state,
      actions.setExternalGrade({ studentId: 1, assessmentId: -5, grade: null }),
    );
    expect(
      next.submissions.find((s) => s.studentId === 1 && s.assessmentId === -5)
        ?.grade,
    ).toBeNull();
  });

  it('UPDATE_EXTERNAL_ASSESSMENT copies bound flags', () => {
    const seed = (overrides = {}): ReturnType<typeof reducer> =>
      reducer(
        undefined,
        actions.saveGradebook({
          categories: [],
          tabs: [{ id: -1, title: 'Ext', categoryId: -1 }],
          assessments: [
            {
              id: -1,
              title: 'Ext',
              tabId: -1,
              maxGrade: 50,
              external: true,
              floorAtZero: true,
              capAtMaximum: true,
            },
          ],
          students: [],
          submissions: [],
          gamificationEnabled: false,
          weightedViewEnabled: true,
          canManageWeights: true,
          courseMaxLevel: 0,
          levelContribution: {
            enabled: false,
            formula: '',
            weight: 0,
            show: false,
            clamp: true,
          },
          ...overrides,
        }),
      );

    const next = reducer(
      seed(),
      actions.updateExternalAssessment({
        assessment: {
          id: -1,
          title: 'Ext',
          tabId: -1,
          maxGrade: 50,
          external: true,
          floorAtZero: false,
          capAtMaximum: false,
        },
        tab: { id: -1, title: 'Ext', categoryId: -1 },
      }),
    );
    const a = next.assessments.find((x) => x.id === -1)!;
    expect(a.floorAtZero).toBe(false);
    expect(a.capAtMaximum).toBe(false);
  });

  it('REORDER_EXTERNAL_ASSESSMENTS permutes external assessments and their synthetic tabs', () => {
    const externalState = {
      ...baseState,
      tabs: [
        { id: -1, title: 'Quiz', categoryId: -1 },
        { id: -2, title: 'Exam', categoryId: -1 },
      ],
      assessments: [
        { id: -1, title: 'Quiz', tabId: -1, maxGrade: 10, external: true },
        { id: -2, title: 'Exam', tabId: -2, maxGrade: 20, external: true },
      ],
    };
    const next = reducer(
      externalState,
      actions.reorderExternalAssessments([-2, -1]),
    );
    expect(next.assessments.map((a) => a.id)).toEqual([-2, -1]);
    expect(next.tabs.map((t) => t.id)).toEqual([-2, -1]);
  });

  it('deleteExternalAssessment is a no-op for an unknown id', () => {
    const seeded = {
      ...state,
      categories: [...state.categories, { id: 2, title: EXTERNAL_ASSESSMENTS }],
      assessments: [
        ...state.assessments,
        { id: -5, title: 'Midterm', tabId: 200, maxGrade: 50, external: true },
      ],
      tabs: [...state.tabs, { id: 200, title: 'Midterm', categoryId: 2 }],
    };
    const next = reducer(seeded, actions.deleteExternalAssessment(-999));
    expect(next.assessments.find((a) => a.id === -5)).toBeDefined();
    expect(next.tabs.find((t) => t.id === 200)).toBeDefined();
    expect(next.categories.find((c) => c.id === 2)).toBeDefined();
  });
});
