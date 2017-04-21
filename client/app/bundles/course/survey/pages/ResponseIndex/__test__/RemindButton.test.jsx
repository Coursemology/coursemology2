import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-addons-test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';

import RemindButton from '../RemindButton';

describe('<RemindButton />', () => {
  it('injects handlers that trigger the reminder', () => {
    const spyRemind = jest.spyOn(CourseAPI.survey.surveys, 'remind');
    const store = storeCreator({ surveys: {} });
    const contextOptions = {
      context: { intl, store, muiTheme },
      childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
    };
    const remindButton = mount(<RemindButton />, contextOptions);
    const remindButtonNode = ReactDOM.findDOMNode(remindButton.find('button').node);
    ReactTestUtils.Simulate.touchTap(remindButtonNode);
    const cancelButton = remindButton.find('ConfirmationDialog').first().node.cancelButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(cancelButton));
    ReactTestUtils.Simulate.touchTap(remindButtonNode);
    const confirmButton = remindButton.find('ConfirmationDialog').first().node.confirmButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(confirmButton));
    expect(spyRemind).toHaveBeenCalled();
  });
});
