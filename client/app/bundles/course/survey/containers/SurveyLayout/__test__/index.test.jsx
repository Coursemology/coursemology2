import React from 'react';
import { mount } from 'enzyme';
import { Router } from 'react-router-dom';
import history from 'lib/history';
import storeCreator from 'course/survey/store';
import SurveyLayout from '../index';

const surveys = [{
  id: 3,
  base_exp: 20,
  canViewResults: true,
  title: 'First Survey',
  published: true,
  start_at: '2017-02-27T00:00:00.000+08:00',
  end_at: '2017-03-12T23:59:00.000+08:00',
  response: null,
}];

describe('<SurveyLayout />', () => {
  it('changes location when the back button is pressed', async () => {
    const surveyId = surveys[0].id.toString();
    const showPageUrl = `/courses/${courseId}/surveys/${surveyId}/`;
    history.push(showPageUrl);
    const spyHistoryPush = jest.spyOn(history, 'push');
    const store = storeCreator({ surveys: { surveys } });

    const routerParams = { match: { params: { courseId, surveyId }, url: showPageUrl, isExact: true } };
    const surveyLayout = mount(
      <Router history={history}>
        <SurveyLayout {...routerParams} />
      </Router>,
      buildContextOptions(store)
    );

    surveyLayout.find('TitleBar').prop('onLeftIconButtonClick')();
    expect(spyHistoryPush).toHaveBeenCalledWith(`/courses/${courseId}/surveys`);
  });
});
