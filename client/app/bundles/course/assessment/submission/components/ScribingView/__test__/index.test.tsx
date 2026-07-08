import { dispatch } from 'store';
import { act, render } from 'test-utils';
import { QuestionType } from 'types/course/assessment/question';
import { ScribingAnswerData } from 'types/course/assessment/submission/answer/scribing';

import ScribingView from 'course/assessment/submission/containers/ScribingView';

import { scribingActions } from '../../../reducers/scribing';

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
        image_url: '/attachments/image1',
        scribbles: [],
        user_id: 10,
      },
      questionType: QuestionType.Scribing,
      createdAt: new Date(1494522137000).toISOString(),
      clientVersion: 1494522137000,
    } as ScribingAnswerData,
  ],
};

describe('ScribingView', () => {
  it('renders canvas', async () => {
    await act(() =>
      dispatch(scribingActions.initialize({ answers: mockSubmission.answers })),
    );

    const loaded = true;
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;

    await act(() =>
      dispatch(scribingActions.setCanvasLoaded({ answerId, loaded })),
    );

    const page = render(<ScribingView answerId={answerId} />, { at: [url] });

    expect(
      await page.findByTestId(`canvas-${answerId}`, {}, { timeout: 5000 }),
    ).toBeVisible();
  });
});
