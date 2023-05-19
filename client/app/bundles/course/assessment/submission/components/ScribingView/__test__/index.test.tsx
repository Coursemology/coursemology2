import { dispatch } from 'store';
import { render } from 'test-utils';

import ScribingView from 'course/assessment/submission/containers/ScribingView';

import { setCanvasLoaded } from '../../../actions/scribing';
import actionTypes from '../../../constants';

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
  questions: [],
  topics: [],
  answers: [
    {
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

jest.mock(
  'course/assessment/submission/loaders/ScribingViewLoader',
  () => (): Promise<void> => Promise.resolve(),
);

describe('ScribingView', () => {
  it('renders canvas', () => {
    dispatch({
      type: actionTypes.FETCH_SUBMISSION_SUCCESS,
      payload: mockSubmission,
    });

    const loaded = true;
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;

    dispatch(setCanvasLoaded(answerId, loaded));

    const page = render(<ScribingView answerId={answerId} />, { at: [url] });

    expect(page.getByTestId(`canvas-${answerId}`)).toBeVisible();
  });
});
