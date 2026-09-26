import { createMockAdapter } from 'mocks/axiosMock';
import { Operation } from 'store';

import CourseAPI from 'api/course';
import { CourseUserType } from 'lib/components/core/CourseUserTypeTabs';
import actionTypes from 'lib/constants';

import translations from '../../translations';
import {
  publishAssessmentAutoFeedback,
  publishAssessmentRubricFeedback,
} from '../aiFeedback';

const mock = createMockAdapter(CourseAPI.assessment.assessments.client);

// Runs thunks inline, so the notification thunk's action is recorded too.
const dispatch = jest.fn((action) =>
  typeof action === 'function' ? action(dispatch) : action,
);
const run = (operation: Operation): Promise<unknown> =>
  operation(dispatch, jest.fn(), {});

const expectNotification = (message: unknown): void =>
  expect(dispatch).toHaveBeenCalledWith(
    expect.objectContaining({ type: actionTypes.SET_NOTIFICATION, message }),
  );

beforeEach(() => {
  mock.reset();
  dispatch.mockClear();
});

describe.each([
  {
    name: 'publishAssessmentAutoFeedback',
    url: /\/assessments\/1\/publish_auto_feedback$/,
    operation: (): Operation =>
      publishAssessmentAutoFeedback(1, CourseUserType.STUDENTS, 5),
    success: translations.publishAutoFeedbackSuccess,
  },
  {
    name: 'publishAssessmentRubricFeedback',
    url: /\/assessments\/1\/publish_rubric_feedback$/,
    operation: (): Operation =>
      publishAssessmentRubricFeedback(1, CourseUserType.STUDENTS),
    success: translations.publishRubricFeedbackSuccess,
  },
])('$name', ({ url, operation, success }) => {
  it('resolves and notifies success when the request succeeds', async () => {
    mock.onPatch(url).reply(200);

    await expect(run(operation())).resolves.toBeUndefined();
    expectNotification(success);
  });

  // The page clears its cached draft count when this resolves, so a failure must not resolve.
  it('notifies failure and rejects when the request fails', async () => {
    mock.onPatch(url).reply(500);

    await expect(run(operation())).rejects.toThrow();
    expectNotification(translations.requestFailure);
  });
});
