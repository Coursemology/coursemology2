import { createMockAdapter } from 'mocks/axiosMock';
import { dispatch } from 'store';

import CourseAPI from 'api/course';
import history from 'lib/history';

import { createResponse } from '../responses';

const client = CourseAPI.survey.responses.client;
const mock = createMockAdapter(client);
const mockNavigate = jest.fn();

beforeEach(() => {
  mock.reset();
  jest.spyOn(history, 'push').mockImplementation();
});

const surveyId = '2';
const responseId = '5';
const responsesUrl = `/courses/${global.courseId}/surveys/${surveyId}/responses`;

describe('createResponse', () => {
  const spyCreate = jest.spyOn(CourseAPI.survey.responses, 'create');

  it('redirects to edit page if response is already created and user can modify or submit it', async () => {
    mock.onPost(responsesUrl).reply(303, {
      responseId,
      canModify: false,
      canSubmit: true,
    });

    await dispatch(createResponse(surveyId, mockNavigate));
    expect(spyCreate).toHaveBeenCalledWith(surveyId);
  });

  it('redirects to show page if response is already created but user cannot modify or submit it', async () => {
    mock.onPost(responsesUrl).reply(303, {
      responseId,
      canModify: false,
      canSubmit: false,
    });

    await dispatch(createResponse(surveyId, mockNavigate));
    expect(spyCreate).toHaveBeenCalledWith(surveyId);
  });
});
