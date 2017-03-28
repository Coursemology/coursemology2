import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import storeCreator from '../../../store';
import SurveyResults from '../index';

const client = CourseAPI.survey.surveys.getClient();
const mock = new MockAdapter(client);

const resultsData = {
  sections: [{
    id: 2,
    weight: 0,
    title: 'Only section',
    description: 'Has one question',
    questions: [{
      id: 5,
      question_type: 'text',
      description: 'Why?',
      weight: 0,
      answers: [{
        id: 123,
        course_user_name: 'Normal student',
        phantom: false,
        text_response: 'Normal answer',
      }, {
        id: 124,
        course_user_name: 'Phantom student',
        phantom: true,
        text_response: 'Phantom answer',
      }],
    }],
  }],
  survey: {
    id: 6,
    title: 'Test Response',
  },
};

beforeEach(() => {
  mock.reset();
});

describe('<SurveyResults />', () => {
  it('allows phantom students to be included in the results', async () => {
    const surveyId = resultsData.survey.id;
    const resultsUrl = `/courses/${courseId}/surveys/${surveyId}/results`;
    mock.onGet(resultsUrl).reply(200, resultsData);
    const spyResults = jest.spyOn(CourseAPI.survey.surveys, 'results');

    // Mount survey restuls page and wait for data to load
    const store = storeCreator({ surveys: {} });
    const contextOptions = {
      context: { intl, store, muiTheme },
      childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
    };
    const surveyResults = mount(
      <SurveyResults params={{ courseId, surveyId: surveyId.toString() }} />,
      contextOptions
    );
    await sleep(1);
    expect(spyResults).toHaveBeenCalled();

    // Toggling 'include phantoms' should result in one more entry
    const rowsPriorToToggle = surveyResults.find('TableRow').length;
    const includePhantomToggle = surveyResults.find('Toggle').first();
    includePhantomToggle.props().onToggle(null, true);
    const rowsAfterToggle = surveyResults.find('TableRow').length;
    expect(rowsAfterToggle).toBe(rowsPriorToToggle + 1);
  });
});
