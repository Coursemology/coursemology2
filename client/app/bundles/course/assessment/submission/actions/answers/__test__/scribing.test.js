import { dispatch, store } from 'store';

import actionTypes from '../../../constants';
import { updateScribingAnswerInLocal } from '../scribing';

const answerId = 3;
const scribblesInJSON = 'newScribble';

const mockSubmission = {
  submission: {
    attemptedAt: '2017-05-11T15:38:11.000+08:00',
    basePoints: 1000,
    graderView: true,
    showPublicTestCasesOutput: true,
    canUpdate: true,
    isCreator: false,
    late: false,
    maximumGrade: 70,
    pointsAwarded: null,
    submittedAt: '2017-05-11T17:02:17.000+08:00',
    submitter: 'Jane',
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
        scribbles: [
          {
            creator_id: 10,
            content: 'oldScribble',
          },
        ],
        user_id: 10,
      },
    },
  ],
};

describe('updateScribingAnswerInLocal', () => {
  it('updates the local scribing answer', async () => {
    dispatch({
      type: actionTypes.FETCH_SUBMISSION_SUCCESS,
      payload: mockSubmission,
    });

    expect(
      store.getState().assessments.submission.scribing[answerId].answer
        .scribbles[0].content,
    ).toBe('oldScribble');

    dispatch(updateScribingAnswerInLocal(answerId, scribblesInJSON));

    expect(
      store.getState().assessments.submission.scribing[answerId].answer
        .scribbles[0].content,
    ).toBe('newScribble');
  });
});
