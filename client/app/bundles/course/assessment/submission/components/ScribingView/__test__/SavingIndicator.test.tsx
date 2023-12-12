import { createMockAdapter } from 'mocks/axiosMock';
import { dispatch } from 'store';
import { render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import ScribingView from 'course/assessment/submission/containers/ScribingView';

import { updateScribingAnswer } from '../../../actions/scribing';
import actionTypes from '../../../constants';

const mock = createMockAdapter(CourseAPI.assessment.answer.scribing.client);

const assessmentId = 1;
const submissionId = 2;
const answerId = 3;

const mockSubmission = {
  submission: {
    attemptedAt: '2017-05-11T15:38:11.000+08:00',
    basePoints: 1000,
    graderView: true,
    canUpdate: true,
    isCreator: false,
    late: false,
    maximumGrade: 70,
    pointsAwarded: null,
    submittedAt: '2017-05-11T17:02:17.000+08:00',
    submitter: { id: 10, name: 'Jane' },
    workflowState: 'submitted',
  },
  assessment: {},
  annotations: [],
  posts: [],
  questions: [{ id: 1, type: 'Scribing', maximumGrade: 5 }],
  topics: [],
  answers: [
    {
      id: answerId,
      fields: {
        id: answerId,
        questionId: 1,
      },
      grading: {
        grade: null,
        id: answerId,
      },
      questionId: 1,
      scribing_answer: {
        answer_id: 23,
        image_path: '/attachments/image1',
        scribbles: [],
        user_id: 10,
      },
    },
  ],
};

beforeEach(() => {
  mock.reset();

  dispatch({
    type: actionTypes.FETCH_SUBMISSION_SUCCESS,
    payload: mockSubmission,
  });
});

describe('SavingIndicator', () => {
  it('sets the saving status', async () => {
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/submissions/${submissionId}`;

    mock.onPost(`${url}/answers/${answerId}/scribing/scribbles`).reply(200);
    const spy = jest.spyOn(CourseAPI.assessment.answer.scribing, 'update');

    const page = render(<ScribingView answerId={answerId} />, {
      at: [`${url}/edit`],
    });
    window.history.pushState({}, '', `${url}/edit`);

    dispatch({
      type: actionTypes.UPDATE_SCRIBING_ANSWER_REQUEST,
      payload: { answerId },
    });

    await waitFor(() =>
      expect(page.getByText('Saving', { exact: false })).toBeVisible(),
    );

    dispatch(updateScribingAnswer(answerId, {}));

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
      expect(page.getByText('Saved', { exact: false })).toBeVisible();
    });
  });

  it('sets saving error', async () => {
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/submissions/${submissionId}`;

    mock.onPost(`${url}/answers/${answerId}/scribing/scribbles`).reply(400);
    const spy = jest.spyOn(CourseAPI.assessment.answer.scribing, 'update');

    const page = render(<ScribingView answerId={answerId} />, {
      at: [`${url}/edit`],
    });
    window.history.pushState({}, '', `${url}/edit`);

    dispatch(updateScribingAnswer(answerId, {}));

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
      expect(page.getByText('Save error', { exact: false })).toBeVisible();
    });
  });
});
