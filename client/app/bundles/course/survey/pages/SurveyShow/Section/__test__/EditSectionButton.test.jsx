import React from 'react';
import ReactDOM from 'react-dom';
import { mount, ReactWrapper } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import SectionFormDialogue from 'course/survey/containers/SectionFormDialogue';
import EditSectionButton from '../EditSectionButton';

const section = {
  id: 3,
  title: 'Section to be edited',
};

describe('<EditSectionButton />', () => {
  it('injects handlers that allow survey sections to be edited', () => {
    const surveyId = 1;
    const spyUpdate = jest.spyOn(CourseAPI.survey.sections, 'update');

    Object.defineProperty(window.location, 'pathname', {
      value: `/courses/${courseId}/surveys/${surveyId}`,
    });
    const contextOptions = buildContextOptions(storeCreator({}));
    const sectionFormDialogue = mount(<SectionFormDialogue />, contextOptions);
    const editSectionButton = mount(<EditSectionButton section={section} />, contextOptions);
    const editSectionButtonNode = ReactDOM.findDOMNode(editSectionButton.find('button').node);
    ReactTestUtils.Simulate.touchTap(editSectionButtonNode);

    const newDescription = 'Added later';
    const dialogInline = sectionFormDialogue.find('RenderToLayer').first().node.layerElement;
    const sectionForm = new ReactWrapper(dialogInline, true).find('form');
    const descriptionInput = sectionForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: newDescription } });

    const submitButton = sectionFormDialogue.find('FormDialogue').first().node.submitButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(submitButton));

    const expectedPayload = { section: { title: section.title, description: newDescription } };
    expect(spyUpdate).toHaveBeenCalledWith(section.id, expectedPayload);
  });
});
