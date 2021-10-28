import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import storeCreator from 'course/survey/store';
import history from 'lib/history';
import {
  createScribingQuestion,
  updateScribingQuestion,
} from '../scribingQuestionActionCreators';
import { initialStates } from '../../reducers';

const originalLocation = window.location;

// Mock axios
const client = CourseAPI.assessment.question.scribing.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
  jest.spyOn(history, 'push').mockImplementation();
  delete window.location;
  window.location = {
    ...originalLocation,
    assign: jest.fn(),
  };
});

afterAll(() => {
  delete window.location;
  window.location = originalLocation;
});

const assessmentId = '2';
const scribingId = '3';

const createResponseUrl = `/courses/${courseId}/assessments/${assessmentId}/question/scribing`;
const updateResponseUrl = `/courses/${courseId}/assessments/${assessmentId}/question/scribing/${scribingId}`;
const redirectUrl = `/courses/${courseId}/assessments/${assessmentId}`;

const mockFields = {
  question_scribing: {
    title: 'Scribing Exercise',
    maximum_grade: 10,
    skill_ids: [],
  },
};

const processedMockFields = {
  question_scribing: {
    title: 'Scribing Exercise',
    maximum_grade: 10,
    question_assessment: { skill_ids: [''] },
  },
};

describe('createScribingQuestion', () => {
  const store = storeCreator({ initialStates });
  const spyCreate = jest.spyOn(
    CourseAPI.assessment.question.scribing,
    'create',
  );

  const newUrl = `/courses/${courseId}/assessments/${assessmentId}/question/scribing/${scribingId}/new`;
  window.history.pushState({}, '', newUrl);

  it('redirects after creation of new scribing question', async () => {
    mock
      .onPost(createResponseUrl)
      .reply(200, { message: 'The scribing question was created.' });
    store.dispatch(createScribingQuestion(mockFields));
    await sleep(1);
    expect(spyCreate).toHaveBeenCalledWith(processedMockFields);
    expect(history.push).toHaveBeenCalledWith(redirectUrl);
    expect(window.location.assign).toHaveBeenCalledWith(redirectUrl);
  });
});

describe('updateScribingQuestion', () => {
  const store = storeCreator({ initialStates });
  const spyUpdate = jest.spyOn(
    CourseAPI.assessment.question.scribing,
    'update',
  );

  const editUrl = `/courses/${courseId}/assessments/${assessmentId}/question/scribing/${scribingId}/edit`;
  window.history.pushState({}, '', editUrl);

  it('redirects after updating of scribing question', async () => {
    mock
      .onPatch(updateResponseUrl)
      .reply(200, { message: 'The scribing question was created.' });
    store.dispatch(updateScribingQuestion(scribingId, mockFields));
    await sleep(1);
    expect(spyUpdate).toHaveBeenCalledWith(scribingId, processedMockFields);
    expect(history.push).toHaveBeenCalledWith(redirectUrl);
    expect(window.location.assign).toHaveBeenCalledWith(redirectUrl);
  });
});
