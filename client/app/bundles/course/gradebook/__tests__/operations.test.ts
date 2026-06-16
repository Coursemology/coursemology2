import CourseAPI from 'api/course';

import { updateGradebookWeights } from '../operations';

jest.mock('api/course', () => ({
  gradebook: {
    updateWeights: jest.fn(),
  },
}));

const mockedUpdateWeights = CourseAPI.gradebook.updateWeights as jest.Mock;

describe('updateGradebookWeights', () => {
  beforeEach(() => {
    mockedUpdateWeights.mockReset();
  });

  // The backend response does NOT echo formulaAst. The operation must merge the
  // client-side formulaAst back into the dispatched payload so the reducer can
  // optimistically recompute each student's levelContribution. Dispatching the
  // raw response strands formulaAst undefined → reducer nulls every student.
  it('merges formulaAst back into the dispatched action', async () => {
    const formulaAst = {
      type: 'call2' as const,
      fn: 'min' as const,
      a: { type: 'var' as const, name: 'level' as const },
      b: { type: 'num' as const, value: 30 },
    };
    mockedUpdateWeights.mockResolvedValue({
      data: {
        weights: [],
        levelContribution: {
          enabled: true,
          formula: 'min(level, 30)',
          weight: 10,
          show: false,
        },
      },
    });

    const dispatch = jest.fn();
    await updateGradebookWeights([], {
      enabled: true,
      formula: 'min(level, 30)',
      formulaAst,
      weight: 10,
      show: false,
      clamp: true,
    })(dispatch, jest.fn(), {});

    expect(dispatch).toHaveBeenCalledTimes(1);
    const dispatched = dispatch.mock.calls[0][0];
    expect(dispatched.payload.levelContribution.formulaAst).toEqual(formulaAst);
  });
});
