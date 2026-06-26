import reducer, { actions } from '../store';

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
};

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

  it('does not set any excluded field', () => {
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
        category: { id: 2, title: 'External Assessments' },
      }),
    );
    expect(next.categories.find((c) => c.id === 2)?.title).toBe(
      'External Assessments',
    );
    expect(next.tabs.find((t) => t.id === 200)?.title).toBe('Midterm');
    expect(next.assessments.find((a) => a.id === -5)?.external).toBe(true);
  });

  it('applyCreatedExternal does not duplicate an existing category/tab', () => {
    const seeded = {
      ...state,
      categories: [
        ...state.categories,
        { id: 2, title: 'External Assessments' },
      ],
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
        category: { id: 2, title: 'External Assessments' },
      }),
    );
    expect(next.categories.filter((c) => c.id === 2)).toHaveLength(1);
    expect(next.tabs.filter((t) => t.id === 200)).toHaveLength(1);
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
      categories: [
        ...state.categories,
        { id: 2, title: 'External Assessments' },
      ],
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
      categories: [
        ...state.categories,
        { id: 2, title: 'External Assessments' },
      ],
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
    const seed = (overrides = {}) =>
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
});
