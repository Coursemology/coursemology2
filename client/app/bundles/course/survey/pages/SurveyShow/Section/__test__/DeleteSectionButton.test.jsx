import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import storeCreator from 'course/survey/store';
import DeleteSectionButton from '../DeleteSectionButton';

describe('<DeleteSectionButton />', () => {
  it('injects handlers that allow survey sections to be deleted', () => {
    const surveyId = 1;
    const sectionId = 7;
    const spyDelete = jest.spyOn(CourseAPI.survey.sections, 'delete');

    Object.defineProperty(window.location, 'pathname', {
      value: `/courses/${courseId}/surveys/${surveyId}`,
    });
    const contextOptions = buildContextOptions(storeCreator({}));
    const deleteConfirmation = mount(<DeleteConfirmation />, contextOptions);
    const deleteSectionButton = mount(<DeleteSectionButton sectionId={sectionId} />, contextOptions);

    deleteSectionButton.find('button').simulate('click');

    const confirmDeleteButton = deleteConfirmation.find('ConfirmationDialog').first().instance().confirmButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(confirmDeleteButton));

    expect(spyDelete).toHaveBeenCalledWith(sectionId);
  });
});
