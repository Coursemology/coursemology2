import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import ResponseShow from '../index';

describe('<ResponseShow />', () => {
  it('allows responses to be saved', async () => {
    const surveyId = '1';
    const responseId = '1';
    const responseUrl = `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`;
    const spyFetch = jest.spyOn(CourseAPI.survey.responses, 'fetch');

    // Mount response show page and wait for data to load
    Object.defineProperty(window.location, 'pathname', { value: responseUrl });
    const store = storeCreator({ surveys: {} });
    const contextOptions = {
      context: { intl, store, muiTheme },
      childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
    };
    mount(
      <ResponseShow params={{ courseId, surveyId, responseId }} />,
      contextOptions
    );
    await sleep(1);
    expect(spyFetch).toHaveBeenCalled();
  });
});
