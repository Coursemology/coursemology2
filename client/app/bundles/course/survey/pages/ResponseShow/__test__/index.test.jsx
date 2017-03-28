import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-addons-test-utils';
import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import storeCreator from 'course/survey/store';
import ResponseShow from '../index';

const client = CourseAPI.survey.responses.getClient();
const mock = new MockAdapter(client);

const responseData = {
  response: {
    id: 5,
    sections: [{
      id: 2,
      weight: 0,
      title: 'Only section',
      description: 'Has one question',
      answers: [{
        id: 3,
        question_id: 4,
        question: {
          id: 4,
          question_type: 'text',
          description: 'Why?',
          required: true,
          weight: 0,
        },
        text_response: 'Current answer',
        options: [],
      }],
    }],
  },
  survey: {
    id: 6,
    title: 'Test Response',
    description: 'Form working?',
  },
};

beforeEach(() => {
  mock.reset();
});

describe('<ResponseShow />', () => {
  it('allows responses to be saved', async () => {
    const surveyId = responseData.survey.id;
    const responseId = responseData.response.id;
    const responseUrl = `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`;
    mock.onGet(`${responseUrl}/edit`).reply(200, responseData);
    const spyFetch = jest.spyOn(CourseAPI.survey.responses, 'fetch');
    const spyUpdate = jest.spyOn(CourseAPI.survey.responses, 'update');

    // Mount response show page and wait for data to load
    Object.defineProperty(window.location, 'pathname', { value: responseUrl });
    const store = storeCreator({ surveys: {} });
    const contextOptions = {
      context: { intl, store, muiTheme },
      childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
    };
    const responseShow = mount(
      <ResponseShow params={{ courseId, responseId: responseId.toString() }} />,
      contextOptions
    );
    await sleep(1);
    expect(spyFetch).toHaveBeenCalled();

    // Fill and submit response form
    const responseForm = responseShow.find('ResponseForm').first();
    const textResponse = responseForm.find('textarea').last();
    const newAnswer = 'New Answer';
    textResponse.simulate('change', { target: { value: newAnswer } });
    const submitButton = responseForm.find('RaisedButton').last().find('button').first();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(submitButton.node));

    const expectedPayload = {
      response: {
        answers_attributes: [{ id: 3, text_response: newAnswer, options_attributes: [] }],
        submit: true,
      },
    };
    expect(spyUpdate).toHaveBeenCalledWith(responseId.toString(), expectedPayload);
  });
});
