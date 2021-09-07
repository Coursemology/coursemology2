import React from 'react';
import { mount, shallow } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import ResponseShow, { UnconnectedResponseShow } from '../index';

describe('<ResponseShow />', () => {
  it('allows responses to be saved', async () => {
    const surveyId = '1';
    const responseId = '1';
    const spyFetch = jest.spyOn(CourseAPI.survey.responses, 'fetch');

    mount(
      <ResponseShow {...{ survey: {}, courseId, surveyId, match: { params: { responseId } } }} />,
      buildContextOptions(storeCreator({}))
    );
    await sleep(1);
    expect(spyFetch).toHaveBeenCalled();
  });

  it('shows form and admin buttons if user has permissions and page is loaded', () => {
    const surveyId = 2;
    const responseId = 2;
    const survey = {
      id: surveyId,
      title: 'Survey',
      description: 'Description',
    };
    const responseFormData = {
      response: {
        id: responseId,
        creator_name: 'Staff',
        submitted_at: '2099-12-31T16:00:00.000Z',
        updated_at: '2099-12-31T16:00:00.000Z',
      },
      flags: {
        canModify: true,
        canSubmit: true,
        canUnsubmit: true,
        isResponseCreator: true,
        isLoading: false,
      },
    };
    const urlParams = {
      courseId,
      surveyId: surveyId.toString(),
      match: { params: { responseId: responseId.toString() } },
    };
    const responseShow = shallow(
      <UnconnectedResponseShow
        dispatch={() => {}}
        survey={survey}
        {...responseFormData}
        {...urlParams}
      />, buildContextOptions(storeCreator({}))
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
    const urlParams = {
      courseId,
      surveyId: surveyId.toString(),
      match: { params: { responseId: responseId.toString() } },
    };
    const responseShow = shallow(
      <UnconnectedResponseShow
        dispatch={() => {}}
        survey={{}}
        {...responseFormData}
        {...urlParams}
      />, buildContextOptions(storeCreator({}))
    );
    expect(responseShow).toMatchSnapshot();
  });
});
