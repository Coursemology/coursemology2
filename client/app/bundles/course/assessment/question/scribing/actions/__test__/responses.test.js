import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import storeCreator from 'course/survey/store';
import history from 'lib/history';
import { createScribingQuestion, updateScribingQuestion } from '../scribingQuestionActionCreators';
import { initialStates } from '../../reducers';

// Mock axios
const client = CourseAPI.question.scribing.scribings.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
  history.push = jest.fn();
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
  const spyCreate = jest.spyOn(CourseAPI.question.scribing.scribings, 'create');

  Object.defineProperty(window.location, 'pathname', {
    writable: true,
    value: `/courses/${courseId}/assessments/${assessmentId}/question/scribing/new`,
  });

  it('redirects after creation of new scribing question', async () => {
    mock.onPost(createResponseUrl).reply(200, { message: 'The scribing question was created.' });
    store.dispatch(createScribingQuestion(mockFields));
    await sleep(1);
    expect(spyCreate).toHaveBeenCalledWith(processedMockFields);
    expect(history.push).toHaveBeenCalledWith(redirectUrl);
  });
});

describe('updateScribingQuestion', () => {
  const store = storeCreator({ initialStates });
  const spyUpdate = jest.spyOn(CourseAPI.question.scribing.scribings, 'update');

  Object.defineProperty(window.location, 'pathname', {
    writable: true,
    value: `/courses/${courseId}/assessments/${assessmentId}/question/scribing/${scribingId}/edit`,
  });

  it('redirects after updating of scribing question', async () => {
    mock.onPatch(updateResponseUrl).reply(200, { message: 'The scribing question was created.' });
    store.dispatch(updateScribingQuestion(scribingId, mockFields));
    await sleep(1);
    expect(spyUpdate).toHaveBeenCalledWith(scribingId, processedMockFields);
    expect(history.push).toHaveBeenCalledWith(redirectUrl);
  });
});
