import CourseAPI from 'api/course';
import notificationActionTypes from 'lib/constants';

import translations from '../../translations';
import { publish } from '../index';

jest.mock('api/course');

// Minimal stand-in for the redux-thunk middleware: recursively invokes any
// dispatched thunk (function) and records every plain action object. This lets
// the test observe the full dispatch sequence of `publish` (including its
// nested `setNotification` thunk) without mounting a real store/reducers.
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

const okResponse = {
  data: { submission: {}, questions: [], answers: [] },
};

describe('publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the generic update-success notification outside a preview course', async () => {
    CourseAPI.assessment.submissions.update.mockResolvedValue(okResponse);

    const dispatched = await runThunk(publish(1, [], 0, false));

    const notification = dispatched.find(
      (action) => action.type === notificationActionTypes.SET_NOTIFICATION,
    );
    expect(notification.message).toBe(translations.updateSuccess);
  });

  it('shows the preview-specific notification inside a preview course', async () => {
    CourseAPI.assessment.submissions.update.mockResolvedValue(okResponse);

    const dispatched = await runThunk(publish(1, [], 0, true));

    const notification = dispatched.find(
      (action) => action.type === notificationActionTypes.SET_NOTIFICATION,
    );
    expect(notification.message).toBe(translations.previewPublishSuccess);
  });

  it('does not show the preview-specific notification on failure', async () => {
    CourseAPI.assessment.submissions.update.mockRejectedValue(
      new Error('network error'),
    );

    const dispatched = await runThunk(publish(1, [], 0, true));

    const notification = dispatched.find(
      (action) => action.type === notificationActionTypes.SET_NOTIFICATION,
    );
    expect(notification.message).toBe(translations.getPastAnswersFailure);
  });
});
