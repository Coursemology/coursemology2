import React from 'react';
import ReactDOM from 'react-dom';
import { mount, ReactWrapper } from 'enzyme';
import ReactTestUtils from 'react-addons-test-utils';
import CourseAPI from 'api/course';
import injectTapEventPlugin from 'react-tap-event-plugin';
import storeCreator from '../../../store';
import NewSurveyButton from '../NewSurveyButton';
import SurveyFormDialogue from '../../../containers/SurveyFormDialogue';

injectTapEventPlugin();

describe('<NewSurveyButton />', () => {
  it('injects handlers that allow surveys to be created', () => {
    const spyCreate = jest.spyOn(CourseAPI.survey.surveys, 'create');
    const store = storeCreator({ surveys: { surveysFlags: { canCreate: true } } });
    const contextOptions = {
      context: { intl, store, muiTheme },
      childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
    };

    const newSurveyButton = mount(<NewSurveyButton />, contextOptions);
    const surveyFormDialogue = mount(<SurveyFormDialogue />, contextOptions);

    // Click 'new survey' button
    const newSurveyButtonNode = ReactDOM.findDOMNode(newSurveyButton.find('button').node);
    ReactTestUtils.Simulate.touchTap(newSurveyButtonNode);
    expect(surveyFormDialogue.find('SurveyFormDialogue').first().props().visible).toBe(true);

    // Fill survey form
    const survey = {
      base_exp: 0,
      start_at: new Date('2016-12-31T16:00:00.000Z'),
      end_at: new Date('2017-01-07T15:59:00.000Z'),
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
