import MockAdapter from 'axios-mock-adapter';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import RespondButton from '../index';

const mock = new MockAdapter(CourseAPI.survey.responses.client);

beforeEach(() => {
  mock.reset();
});

const surveyId = '2';

describe('<RespondButton />', () => {
  it('allows responses to be created', async () => {
    const responsesUrl = `/courses/${courseId}/surveys/${surveyId}/responses/`;
    mock.onPost(responsesUrl).reply(200, {});
    const spyCreate = jest.spyOn(CourseAPI.survey.responses, 'create');

    const page = render(
      <RespondButton
        canModify
        canRespond
        canSubmit
        {...{ courseId, surveyId }}
      />,
    );

    fireEvent.click(page.getByRole('button'));

    await waitFor(() => {
      expect(spyCreate).toHaveBeenCalledWith(surveyId);
    });
  });
});
