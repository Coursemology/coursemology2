import React from 'react';
import { mount } from 'enzyme';
import { connect } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import storeCreator from 'course/survey/store';
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
        response_path: `/courses/${courseId}/surveys/6/responses/9`,
      }, {
        id: 124,
        course_user_name: 'Phantom student',
        phantom: true,
        text_response: 'Phantom answer',
        response_path: `/courses/${courseId}/surveys/6/responses/10`,
      }],
    }],
  }],
  survey: {
    id: 6,
    title: 'Test Response',
    anonymous: false,
  },
};

const InjectedSurveyResults = connect(
  state => ({ survey: state.surveys[0] || {} })
)(SurveyResults);

beforeEach(() => {
  mock.reset();
});

describe('<SurveyResults />', () => {
  it('allows phantom students to be excluded from the results', async () => {
    const surveyId = resultsData.survey.id.toString();
    const resultsUrl = `/courses/${courseId}/surveys/${surveyId}/results`;
    mock.onGet(resultsUrl).reply(200, resultsData);
    const spyResults = jest.spyOn(CourseAPI.survey.surveys, 'results');

    const surveyResults = mount(
      <MemoryRouter>
        <InjectedSurveyResults {...{ courseId, surveyId }} />
      </MemoryRouter>,
      buildContextOptions(storeCreator({}))
    );
    await sleep(1);
    expect(spyResults).toHaveBeenCalled();

    // Toggling 'include phantoms' should result in one more entry
    surveyResults.update();
    const rowsPriorToToggle = surveyResults.find('TableRow').length;
    const includePhantomToggle = surveyResults.find('Toggle').first();
    includePhantomToggle.props().onToggle(null, false);
    surveyResults.update();
    const rowsAfterToggle = surveyResults.find('TableRow').length;
    expect(rowsAfterToggle).toBe(rowsPriorToToggle - 1);
  });
});
