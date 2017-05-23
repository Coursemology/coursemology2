import React from 'react';
import ReactDOM from 'react-dom';
import { mount, ReactWrapper } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';
import NewSurveyButton from '../NewSurveyButton';

describe('<NewSurveyButton />', () => {
  it('injects handlers that allow surveys to be created', () => {
    const spyCreate = jest.spyOn(CourseAPI.survey.surveys, 'create');
    const store = storeCreator({ surveys: { surveysFlags: { canCreate: true } } });
    const contextOptions = buildContextOptions(store);

    const surveyFormDialogue = mount(<SurveyFormDialogue />, contextOptions);
    const newSurveyButton = mount(<NewSurveyButton />, contextOptions);

    // Click 'new survey' button
    const newSurveyButtonNode = ReactDOM.findDOMNode(newSurveyButton.find('button').node);
    ReactTestUtils.Simulate.touchTap(newSurveyButtonNode);
    expect(surveyFormDialogue.find('SurveyFormDialogue').first().props().visible).toBe(true);

    // Fill survey form
    const survey = {
      base_exp: 0,
      time_bonus_exp: 0,
      start_at: new Date('2016-12-31T16:00:00.000Z'),
      end_at: new Date('2017-01-07T15:59:00.000Z'),
      bonus_end_at: null,
      title: 'Funky survey title',
    };

    const startAt = '01-01-2017';
    const dialogInline = surveyFormDialogue.find('RenderToLayer').first().node.layerElement;
    const surveyForm = new ReactWrapper(dialogInline, true).find('form');
    const titleInput = surveyForm.find('input[name="title"]');
    titleInput.simulate('change', { target: { value: survey.title } });
    const startAtDateInput = surveyForm.find('input[name="start_at"]').first();
    startAtDateInput.simulate('change', { target: { value: startAt } });
    startAtDateInput.simulate('blur');

    // Submit survey form
    const submitButton = surveyFormDialogue.find('FormDialogue').first().node.submitButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(submitButton));
    expect(spyCreate).toHaveBeenCalledWith({ survey });
  });
});
