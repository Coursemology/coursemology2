import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-addons-test-utils';
import CourseAPI from 'api/course';
import storeCreator from '../../../../store';
import DeleteSectionButton from '../DeleteSectionButton';
import DeleteConfirmation from '../../../../containers/SurveyLayout/DeleteConfirmation';

describe('<DeleteSectionButton />', () => {
  it('injects handlers that allow survey sections to be deleted', () => {
    const surveyId = 1;
    const sectionId = 7;
    const spyDelete = jest.spyOn(CourseAPI.survey.sections, 'delete');
    const store = storeCreator({ surveys: {} });
    const contextOptions = {
      context: { intl, store, muiTheme },
      childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
    };

    Object.defineProperty(window.location, 'pathname', {
      value: `/courses/${courseId}/surveys/${surveyId}`,
    });
    const deleteConfirmation = mount(<DeleteConfirmation />, contextOptions);
    const deleteSectionButton =
      mount(<DeleteSectionButton sectionId={sectionId} />, contextOptions);

    const deleteSectionButtonNode = ReactDOM.findDOMNode(deleteSectionButton.find('button').node);
    ReactTestUtils.Simulate.touchTap(deleteSectionButtonNode);

    const confirmDeleteButton =
      deleteConfirmation.find('ConfirmationDialog').first().node.confirmButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(confirmDeleteButton));

    expect(spyDelete).toHaveBeenCalledWith(sectionId);
  });
});
