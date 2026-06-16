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
  courseMaxLevel: 0,
  levelContribution: {
    enabled: false,
    formula: '',
    weight: 0,
    show: false,
    clamp: true,
  },
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
