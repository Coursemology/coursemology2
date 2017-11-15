import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';

import RemindButton from '../RemindButton';

describe('<RemindButton />', () => {
  it('injects handlers that trigger the reminder', () => {
    const spyRemind = jest.spyOn(CourseAPI.survey.surveys, 'remind');
    const store = storeCreator({ surveys: {} });
    const remindButton = mount(<RemindButton />, buildContextOptions(store));
    remindButton.find('button').simulate('click');
    const cancelButton = remindButton.find('ConfirmationDialog').first().instance().cancelButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(cancelButton));
    remindButton.find('button').simulate('click');
    const confirmButton = remindButton.find('ConfirmationDialog').first().instance().confirmButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(confirmButton));
    expect(spyRemind).toHaveBeenCalled();
  });
});
