import React from 'react';
import { mount, shallow } from 'enzyme';
import { browserHistory } from 'react-router';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import ResponseShow, { UnconnectedResponseShow } from '../index';

const generateContextOptions = store => ({
  context: { intl, store, muiTheme },
  childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
});

describe('<ResponseShow />', () => {
  it('allows responses to be saved', async () => {
    const surveyId = '1';
    const responseId = '1';
    const responseUrl = `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`;
    const spyFetch = jest.spyOn(CourseAPI.survey.responses, 'fetch');

    // Mount response show page and wait for data to load
    Object.defineProperty(window.location, 'pathname', { value: responseUrl });
    mount(
      <ResponseShow params={{ courseId, surveyId, responseId }} />,
      generateContextOptions(storeCreator({}))
    );
    await sleep(1);
    expect(spyFetch).toHaveBeenCalled();
  });

  it('shows form and admin buttons if user has permissions and page is loaded', () => {
    const surveyId = 2;
    const responseId = 2;
    const surveys = [{
      id: surveyId,
      title: 'Survey',
      description: 'Description',
    }];
    const responseFormData = {
      response: {
        id: responseId,
        creator_name: 'Staff',
        submitted_at: '2099-12-31T16:00:00.000Z',
      },
      flags: {
        canModify: true,
        canSubmit: true,
        canUnsubmit: true,
        isResponseCreator: true,
        isLoading: false,
      },
    };
    const responseShow = shallow(
      <UnconnectedResponseShow
        params={{ courseId, surveyId: surveyId.toString(), responseId: responseId.toString() }}
        dispatch={() => {}}
        surveys={surveys}
        {...responseFormData}
      />, generateContextOptions(storeCreator({}))
    );
    expect(responseShow).toMatchSnapshot();
  });

  it('shows only title and loading indicator when loading', () => {
    const surveyId = 2;
    const responseId = 2;
    const responseFormData = {
      response: {
        id: responseId,
        creator_name: 'Student',
      },
      flags: {
        canModify: true,
        canSubmit: true,
        canUnsubmit: true,
        isResponseCreator: true,
        isLoading: true,
      },
    };
    const responseShow = shallow(
      <UnconnectedResponseShow
        params={{ courseId, surveyId: surveyId.toString(), responseId: responseId.toString() }}
        dispatch={() => {}}
        {...responseFormData}
      />, generateContextOptions(storeCreator({}))
    );
    expect(responseShow).toMatchSnapshot();
  });

  it('goes to SurveyShow page when title bar back button is triggered', () => {
    const surveyId = '3';
    const responseId = '3';

    const responseShow = shallow(
      <UnconnectedResponseShow
        params={{ courseId, surveyId, responseId }}
        dispatch={() => {}}
        flags={{ isLoading: true }}
      />, generateContextOptions(storeCreator({}))
    );

    browserHistory.push = jest.fn();
    responseShow.find('TitleBar').first().prop('onLeftIconButtonTouchTap')();
    expect(browserHistory.push).toHaveBeenCalledWith(`/courses/${courseId}/surveys/${surveyId}`);
  });
});
