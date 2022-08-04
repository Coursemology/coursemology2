import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import store from 'course/assessment/submission/store';
import ScribingView from 'course/assessment/submission/containers/ScribingView';
import { updateScribingAnswer } from '../../../actions/scribing';
import actionTypes from '../../../constants';

const client = CourseAPI.assessment.answer.scribing.getClient();
const mock = new MockAdapter(client);

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

// stub import function
jest.mock(
  'course/assessment/submission/loaders/ScribingViewLoader',
  () => () => Promise.resolve(),
);

beforeEach(() => {
  mock.reset();
  store.dispatch({
    type: actionTypes.FETCH_SUBMISSION_SUCCESS,
    payload: mockSubmission,
  });
});

describe('SavingIndicator', () => {
  it('sets the saving status', async () => {
    const editPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[
            `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`,
          ]}
        >
          <ScribingView answerId={answerId} />
        </MemoryRouter>
      </ProviderWrapper>,
    );

    store.dispatch({
      type: actionTypes.UPDATE_SCRIBING_ANSWER_REQUEST,
      payload: { answerId },
    });
    editPage.update();
    expect(editPage.find('SavingIndicator').prop('isSaving')).toBe(true);

    const editUrl = `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;
    window.history.pushState({}, '', editUrl);
    mock
      .onPost(
        `/courses/${courseId}/assessments/${assessmentId}\
/submissions/${submissionId}/answers/${answerId}/scribing/scribbles`,
      )
      .reply(200);
    const spyUpdate = jest.spyOn(
      CourseAPI.assessment.answer.scribing,
      'update',
    );
    store.dispatch(updateScribingAnswer(answerId, {}));
    await sleep(1);
    expect(spyUpdate).toHaveBeenCalled();
    editPage.update();
    expect(editPage.find('SavingIndicator').prop('isSaved')).toBe(true);
  });

  it('sets saving error', async () => {
    const editPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[
            `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`,
          ]}
        >
          <ScribingView answerId={answerId} />
        </MemoryRouter>
      </ProviderWrapper>,
    );

    const editUrl = `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;
    window.history.pushState({}, '', editUrl);
    mock
      .onPost(
        `/courses/${courseId}/assessments/${assessmentId}\
/submissions/${submissionId}/answers/${answerId}/scribing/scribbles`,
      )
      .reply(400);
    const spyUpdate = jest.spyOn(
      CourseAPI.assessment.answer.scribing,
      'update',
    );
    store.dispatch(updateScribingAnswer(answerId, {}));
    await sleep(1);
    expect(spyUpdate).toHaveBeenCalled();
    editPage.update();
    expect(editPage.find('SavingIndicator').prop('hasError')).toBe(true);
  });
});
