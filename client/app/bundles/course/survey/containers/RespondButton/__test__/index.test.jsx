import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
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

    const respondButtonNode = respondButton.find('button').first().node;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(respondButtonNode));

    await sleep(1);
    expect(spyCreate).toHaveBeenCalledWith(surveyId);
  });
});
