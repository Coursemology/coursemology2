import type { AppDispatch } from 'store';

import CourseAPI from 'api/course';

import fetchGradebook, {
  createExternalAssessment,
  deleteExternalAssessment,
  editExternalAssessment,
  reorderExternalAssessments,
  setExternalGrade,
  updateGradebookWeights,
} from '../operations';

const REORDER = 'course/gradebook/REORDER_EXTERNAL_ASSESSMENTS';

const externals = [
  { id: -1, title: 'A', tabId: -1, maxGrade: 10, external: true },
  { id: -2, title: 'B', tabId: -2, maxGrade: 10, external: true },
];

// Minimal thunk harness: record plain actions, stub getState.
const harness = (): {
  dispatched: { type: string; payload: unknown }[];
  dispatch: AppDispatch;
  getState: () => never;
} => {
  const dispatched: { type: string; payload: unknown }[] = [];
  return {
    dispatched,
    // The operation only dispatches plain { type, payload } actions, which we
    // record; cast to AppDispatch so it satisfies the thunk's dispatch param.
    dispatch: ((a: { type: string; payload: unknown }) => {
      dispatched.push(a);
      return a;
    }) as unknown as AppDispatch,
    getState: () => ({ gradebook: { assessments: externals } }) as never,
  };
};

describe('reorderExternalAssessments', () => {
  afterEach(() => jest.restoreAllMocks());

  it('applies optimistically, then reverts and rethrows when the PUT fails', async () => {
    const { dispatched, dispatch, getState } = harness();
    jest
      .spyOn(CourseAPI.gradebook, 'reorderExternals')
      .mockRejectedValue(new Error('network'));

    await expect(
      reorderExternalAssessments([-2, -1])(dispatch, getState, {}),
    ).rejects.toThrow('network');

    const reorders = dispatched.filter((a) => a.type === REORDER);
    expect(reorders[0].payload).toEqual([-2, -1]); // optimistic apply
    expect(reorders[reorders.length - 1].payload).toEqual([-1, -2]); // rolled back to original
  });

  it('does not roll back on success', async () => {
    const { dispatched, dispatch, getState } = harness();
    jest
      .spyOn(CourseAPI.gradebook, 'reorderExternals')
      .mockResolvedValue({ data: undefined } as never);

    await reorderExternalAssessments([-2, -1])(dispatch, getState, {});

    const reorders = dispatched.filter((a) => a.type === REORDER);
    expect(reorders).toHaveLength(1);
    expect(reorders[0].payload).toEqual([-2, -1]);
  });

  it('calls the API with positive external ids (negated store ids)', async () => {
    const { dispatch, getState } = harness();
    const spy = jest
      .spyOn(CourseAPI.gradebook, 'reorderExternals')
      .mockResolvedValue({ data: undefined } as never);

    await reorderExternalAssessments([-2, -1])(dispatch, getState, {});

    expect(spy).toHaveBeenCalledWith({ orderedIds: [2, 1] });
  });

  it('rolls back only external assessments in their stored order', async () => {
    const dispatched: { type: string; payload: unknown }[] = [];
    const dispatch = ((a: { type: string; payload: unknown }) => {
      dispatched.push(a);
      return a;
    }) as unknown as AppDispatch;
    const getState = (() => ({
      gradebook: {
        assessments: [
          { id: 5, external: false },
          ...externals, // ids -1, -2
        ],
      },
    })) as unknown as () => never;
    jest
      .spyOn(CourseAPI.gradebook, 'reorderExternals')
      .mockRejectedValue(new Error('network'));

    await expect(
      reorderExternalAssessments([-2, -1])(dispatch, getState, {}),
    ).rejects.toThrow('network');

    const reorders = dispatched.filter((a) => a.type === REORDER);
    expect(reorders[reorders.length - 1].payload).toEqual([-1, -2]);
  });
});

describe('setExternalGrade', () => {
  afterEach(() => jest.restoreAllMocks());

  const gradeHarness = (
    submissions: {
      studentId: number;
      assessmentId: number;
      grade: number | null;
    }[],
  ): {
    dispatched: { type: string; payload: unknown }[];
    dispatch: AppDispatch;
    getState: () => never;
  } => {
    const dispatched: { type: string; payload: unknown }[] = [];
    return {
      dispatched,
      dispatch: ((a: { type: string; payload: unknown }) => {
        dispatched.push(a);
        return a;
      }) as unknown as AppDispatch,
      getState: () => ({ gradebook: { submissions } }) as never,
    };
  };

  const SET = 'course/gradebook/SET_EXTERNAL_GRADE';

  it('applies optimistically, calls the API with the negated id, then reconciles', async () => {
    const { dispatched, dispatch, getState } = gradeHarness([
      { studentId: 7, assessmentId: -1, grade: 3 },
    ]);
    const spy = jest
      .spyOn(CourseAPI.gradebook, 'setExternalGrade')
      .mockResolvedValue({
        data: { studentId: 7, assessmentId: -1, grade: 9 },
      } as never);

    await setExternalGrade(-1, 7, 9)(dispatch, getState, {});

    expect(spy).toHaveBeenCalledWith(1, { studentId: 7, grade: 9 });
    const sets = dispatched.filter((a) => a.type === SET);
    expect(sets[0].payload).toEqual({
      studentId: 7,
      assessmentId: -1,
      grade: 9,
    }); // optimistic
    expect(sets[sets.length - 1].payload).toEqual({
      studentId: 7,
      assessmentId: -1,
      grade: 9,
    }); // reconciled from response.data
  });

  it('restores the prior grade and rethrows when the PUT fails', async () => {
    const { dispatched, dispatch, getState } = gradeHarness([
      { studentId: 7, assessmentId: -1, grade: 3 },
    ]);
    jest
      .spyOn(CourseAPI.gradebook, 'setExternalGrade')
      .mockRejectedValue(new Error('network'));

    await expect(
      setExternalGrade(-1, 7, 9)(dispatch, getState, {}),
    ).rejects.toThrow('network');

    const sets = dispatched.filter((a) => a.type === SET);
    expect(sets[0].payload).toEqual({
      studentId: 7,
      assessmentId: -1,
      grade: 9,
    }); // optimistic
    expect(sets[sets.length - 1].payload).toEqual({
      studentId: 7,
      assessmentId: -1,
      grade: 3,
    }); // rolled back to prev
  });

  it('rolls back to null when no prior submission exists', async () => {
    const { dispatched, dispatch, getState } = gradeHarness([]);
    jest
      .spyOn(CourseAPI.gradebook, 'setExternalGrade')
      .mockRejectedValue(new Error('network'));

    await expect(
      setExternalGrade(-1, 7, 9)(dispatch, getState, {}),
    ).rejects.toThrow('network');

    const sets = dispatched.filter((a) => a.type === SET);
    expect(sets[sets.length - 1].payload).toEqual({
      studentId: 7,
      assessmentId: -1,
      grade: null,
    });
  });
});

describe('createExternalAssessment', () => {
  afterEach(() => jest.restoreAllMocks());

  const createHarness = (): {
    dispatch: AppDispatch;
    getState: () => never;
  } => ({
    dispatch: ((a: unknown) => a) as unknown as AppDispatch,
    getState: (() => ({})) as unknown as () => never,
  });

  it('omits weight from the payload when undefined', async () => {
    const { dispatch, getState } = createHarness();
    const spy = jest
      .spyOn(CourseAPI.gradebook, 'createExternal')
      .mockResolvedValue({ data: {} } as never);

    await createExternalAssessment(
      'A',
      10,
      true,
      false,
    )(dispatch, getState, {});

    expect(spy).toHaveBeenCalledWith({
      title: 'A',
      maximumGrade: 10,
      floorAtZero: true,
      capAtMaximum: false,
    });
  });

  it('includes weight in the payload when provided', async () => {
    const { dispatch, getState } = createHarness();
    const spy = jest
      .spyOn(CourseAPI.gradebook, 'createExternal')
      .mockResolvedValue({ data: {} } as never);

    await createExternalAssessment(
      'A',
      10,
      true,
      false,
      2,
    )(dispatch, getState, {});

    expect(spy).toHaveBeenCalledWith({
      title: 'A',
      maximumGrade: 10,
      floorAtZero: true,
      capAtMaximum: false,
      weight: 2,
    });
  });
});

describe('id-negating thunks', () => {
  afterEach(() => jest.restoreAllMocks());

  const noopHarness = (): { dispatch: AppDispatch; getState: () => never } => ({
    dispatch: ((a: unknown) => a) as unknown as AppDispatch,
    getState: (() => ({})) as unknown as () => never,
  });

  it('editExternalAssessment negates the id and forwards the patch', async () => {
    const { dispatch, getState } = noopHarness();
    const spy = jest
      .spyOn(CourseAPI.gradebook, 'updateExternal')
      .mockResolvedValue({ data: {} } as never);

    await editExternalAssessment(-3, { maximumGrade: 20 })(
      dispatch,
      getState,
      {},
    );

    expect(spy).toHaveBeenCalledWith(3, { maximumGrade: 20 });
  });

  it('deleteExternalAssessment negates the id for the API but dispatches the original id', async () => {
    const dispatched: { type: string; payload: unknown }[] = [];
    const dispatch = ((a: { type: string; payload: unknown }) => {
      dispatched.push(a);
      return a;
    }) as unknown as AppDispatch;
    const spy = jest
      .spyOn(CourseAPI.gradebook, 'deleteExternal')
      .mockResolvedValue({ data: undefined } as never);

    await deleteExternalAssessment(-3)(dispatch, (() => ({})) as never, {});

    expect(spy).toHaveBeenCalledWith(3);
    expect(dispatched).toContainEqual({
      type: 'course/gradebook/DELETE_EXTERNAL_ASSESSMENT',
      payload: -3,
    });
  });
});

describe('simple pass-through thunks', () => {
  afterEach(() => jest.restoreAllMocks());

  const passHarness = (): {
    dispatched: { type: string; payload: unknown }[];
    dispatch: AppDispatch;
    getState: () => never;
  } => {
    const dispatched: { type: string; payload: unknown }[] = [];
    return {
      dispatched,
      dispatch: ((a: { type: string; payload: unknown }) => {
        dispatched.push(a);
        return a;
      }) as unknown as AppDispatch,
      getState: (() => ({})) as unknown as () => never,
    };
  };

  it('fetchGradebook dispatches saveGradebook with the index response', async () => {
    const { dispatched, dispatch, getState } = passHarness();
    jest
      .spyOn(CourseAPI.gradebook, 'index')
      .mockResolvedValue({ data: { loaded: true } } as never);

    await fetchGradebook()(dispatch, getState, {});

    expect(dispatched).toContainEqual({
      type: 'course/gradebook/SAVE_GRADEBOOK',
      payload: { loaded: true },
    });
  });

  it('updateGradebookWeights wraps weights and dispatches updateTabWeights', async () => {
    const { dispatched, dispatch, getState } = passHarness();
    const spy = jest
      .spyOn(CourseAPI.gradebook, 'updateWeights')
      .mockResolvedValue({ data: { weights: [] } } as never);

    await updateGradebookWeights([])(dispatch, getState, {});

    expect(spy).toHaveBeenCalledWith({ weights: [] });
    expect(dispatched).toContainEqual({
      type: 'course/gradebook/UPDATE_TAB_WEIGHTS',
      payload: { weights: [] },
    });
  });

  // The backend response does NOT echo formulaAst. The operation must merge the
  // client-side formulaAst back into the dispatched payload so the reducer can
  // optimistically recompute each student's levelContribution. Dispatching the
  // raw response strands formulaAst undefined → reducer nulls every student.
  it('merges formulaAst back into the dispatched updateTabWeights action', async () => {
    const formulaAst = {
      type: 'call2' as const,
      fn: 'min' as const,
      a: { type: 'var' as const, name: 'level' as const },
      b: { type: 'num' as const, value: 30 },
    };
    jest.spyOn(CourseAPI.gradebook, 'updateWeights').mockResolvedValue({
      data: {
        weights: [],
        levelContribution: {
          enabled: true,
          formula: 'min(level, 30)',
          weight: 10,
          show: false,
        },
      },
    } as never);

    const dispatched: { type: string; payload: unknown }[] = [];
    const dispatch = ((a: { type: string; payload: unknown }) => {
      dispatched.push(a);
      return a;
    }) as unknown as AppDispatch;

    await updateGradebookWeights([], {
      enabled: true,
      formula: 'min(level, 30)',
      formulaAst,
      weight: 10,
      show: false,
      clamp: true,
    })(dispatch, (() => ({})) as never, {});

    expect(dispatched).toHaveLength(1);
    const action = dispatched[0] as {
      payload: { levelContribution: { formulaAst: unknown } };
    };
    expect(action.payload.levelContribution.formulaAst).toEqual(formulaAst);
  });
});
