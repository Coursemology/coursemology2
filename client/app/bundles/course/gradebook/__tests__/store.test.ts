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
});
