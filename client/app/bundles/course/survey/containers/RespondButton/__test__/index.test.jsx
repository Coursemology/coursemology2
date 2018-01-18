import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import storeCreator from 'course/survey/store';
import RespondButton from '../index';

const client = CourseAPI.survey.responses.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
});

const surveyId = '2';

describe('<RespondButton />', () => {
  it('allows responses to be created', async () => {
    const responsesUrl = `/courses/${courseId}/surveys/${surveyId}/responses/`;
    mock.onPost(responsesUrl).reply(200, {});
    const spyCreate = jest.spyOn(CourseAPI.survey.responses, 'create');

    const respondButton = mount(
      <RespondButton
        canRespond
        canModify
        canSubmit
        {...{ courseId, surveyId }}
      />,
      buildContextOptions(storeCreator({}))
    );

    respondButton.find('button').simulate('click');

    await sleep(1);
    expect(spyCreate).toHaveBeenCalledWith(surveyId);
  });
});
