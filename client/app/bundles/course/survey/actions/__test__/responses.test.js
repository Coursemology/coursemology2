import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import storeCreator from 'course/survey/store';
import history from 'lib/history';
import { createResponse } from '../responses';

const client = CourseAPI.survey.responses.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
  history.push = jest.fn();
});

const surveyId = '2';
const responseId = '5';
const responsesUrl = `/courses/${courseId}/surveys/${surveyId}/responses`;
const responseUrl = `${responsesUrl}/${responseId}`;
const responseEditUrl = `${responsesUrl}/${responseId}/edit`;

describe('createResponse', () => {
  const store = storeCreator({ surveys: {} });
  const spyCreate = jest.spyOn(CourseAPI.survey.responses, 'create');

  it('redirects to edit page if response is already created and user can modify or submit it', async () => {
    mock.onPost(responsesUrl).reply(303, {
      responseId,
      canModify: false,
      canSubmit: true,
    });

    store.dispatch(createResponse(surveyId));
    await sleep(1);
    expect(spyCreate).toHaveBeenCalledWith(surveyId);
    expect(history.push).toHaveBeenCalledWith(responseEditUrl);
  });

  it('redirects to show page if response is already created but user cannot modify or submit it', async () => {
    mock.onPost(responsesUrl).reply(303, {
      responseId,
      canModify: false,
      canSubmit: false,
    });

    store.dispatch(createResponse(surveyId));
    await sleep(1);
    expect(spyCreate).toHaveBeenCalledWith(surveyId);
    expect(history.push).toHaveBeenCalledWith(responseUrl);
  });
});
