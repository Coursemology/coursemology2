import CourseAPI from 'api/course';

import { previewAutogradingStarted } from '../../reducers/previewAutograding';
import { finalise } from '../index';

jest.mock('api/course');

// Minimal stand-in for the redux-thunk middleware: recursively invokes any
// dispatched thunk (function) and records every plain action object. Mirrors the
// helper in publish.test.js.
const runThunk = async (thunk) => {
  const dispatched = [];
  const dispatch = (action) => {
    if (typeof action === 'function') return action(dispatch, () => ({}));
    dispatched.push(action);
    return action;
  };
  await thunk(dispatch, () => ({}));
  return dispatched;
};

const startedActions = (dispatched) =>
  dispatched.filter((action) => action.type === previewAutogradingStarted.type);

describe('finalise', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts polling when the response carries a preview auto-grading job url', async () => {
    CourseAPI.assessment.submissions.update.mockResolvedValue({
      data: {
        submission: { autoGradingJobUrl: '/jobs/9' },
        questions: [],
        answers: [],
      },
    });

    const dispatched = await runThunk(finalise(1, []));

    expect(startedActions(dispatched)).toEqual([
      previewAutogradingStarted({ jobUrl: '/jobs/9' }),
    ]);
  });

  it('does not start polling outside a preview course, where the key is absent', async () => {
    CourseAPI.assessment.submissions.update.mockResolvedValue({
      data: { submission: {}, questions: [], answers: [] },
    });

    const dispatched = await runThunk(finalise(1, []));

    expect(startedActions(dispatched)).toEqual([]);
  });

  it('does not start polling when finalising fails', async () => {
    CourseAPI.assessment.submissions.update.mockRejectedValue(
      new Error('network error'),
    );

    const dispatched = await runThunk(finalise(1, []));

    expect(startedActions(dispatched)).toEqual([]);
  });

  it('still dispatches FINALISE_SUCCESS alongside the polling action', async () => {
    CourseAPI.assessment.submissions.update.mockResolvedValue({
      data: {
        submission: { autoGradingJobUrl: '/jobs/9' },
        questions: [],
        answers: [],
      },
    });

    const dispatched = await runThunk(finalise(1, []));

    expect(
      dispatched.some((action) => action.type === 'FINALISE_SUCCESS'),
    ).toBe(true);
  });
});
