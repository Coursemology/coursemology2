import CourseAPI from 'api/course';
import { redirectToNotFound } from 'lib/hooks/router/redirect';

import { fetchSubmission, loadSubmissionPage } from '../index';

jest.mock('api/course');
jest.mock('lib/hooks/router/redirect', () => ({
  redirectToNotFound: jest.fn(),
}));

// Minimal stand-in for the redux-thunk middleware: recursively invokes any
// dispatched thunk (function) and records every plain action object. Mirrors the
// helper in publish.test.js and finalise.test.js.
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

describe('fetchSubmission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hands the axios error to onError when the fetch fails', async () => {
    const error = { response: { status: 404 } };
    CourseAPI.assessment.submissions.edit.mockRejectedValue(error);
    const onError = jest.fn();

    await runThunk(fetchSubmission(42, undefined, onError));

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('does not call onError when the fetch succeeds', async () => {
    CourseAPI.assessment.submissions.edit.mockResolvedValue({
      data: {
        submission: { id: 42 },
        questions: [],
        answers: [],
        history: { questions: [] },
      },
    });
    const onError = jest.fn();

    await runThunk(fetchSubmission(42, undefined, onError));

    expect(onError).not.toHaveBeenCalled();
  });

  it('still dispatches FETCH_SUBMISSION_FAILURE when onError is omitted', async () => {
    CourseAPI.assessment.submissions.edit.mockRejectedValue({
      response: { status: 500 },
    });

    const dispatched = await runThunk(fetchSubmission(42));

    expect(
      dispatched.some((action) => action.type === 'FETCH_SUBMISSION_FAILURE'),
    ).toBe(true);
  });
});

describe('loadSubmissionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the viewer to the not-found page when the fetch 404s', async () => {
    CourseAPI.assessment.submissions.edit.mockRejectedValue({
      response: { status: 404 },
    });

    await runThunk(loadSubmissionPage(42));

    expect(redirectToNotFound).toHaveBeenCalled();
  });

  // Only a 404 means "no such submission under this assessment". This matters beyond tidiness: the
  // marketplace preview banner reads the very same 404 as a purged sandbox and has its own message
  // for it, which is why it refetches through `fetchSubmission` directly rather than through here.
  it('stays on the page on any other failure', async () => {
    CourseAPI.assessment.submissions.edit.mockRejectedValue({
      response: { status: 500 },
    });

    const dispatched = await runThunk(loadSubmissionPage(42));

    expect(redirectToNotFound).not.toHaveBeenCalled();
    expect(
      dispatched.some((action) => action.type === 'FETCH_SUBMISSION_FAILURE'),
    ).toBe(true);
  });

  it('stays on the page when the fetch succeeds', async () => {
    CourseAPI.assessment.submissions.edit.mockResolvedValue({
      data: {
        submission: { id: 42 },
        questions: [],
        answers: [],
        history: { questions: [] },
      },
    });

    await runThunk(loadSubmissionPage(42));

    expect(redirectToNotFound).not.toHaveBeenCalled();
  });
});
