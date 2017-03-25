import React from 'react';
import ReactDOM from 'react-dom';
import { mount, ReactWrapper } from 'enzyme';
import ReactTestUtils from 'react-addons-test-utils';
import CourseAPI from 'api/course';
import storeCreator from '../../../store';
import NewSectionButton from '../NewSectionButton';
import SectionFormDialogue from '../../../containers/SectionFormDialogue';

describe('<NewSectionButton />', () => {
  it('injects handlers that allow survey sections to be created', () => {
    const spyCreate = jest.spyOn(CourseAPI.survey.sections, 'create');
    const store = storeCreator({ surveys: {} });
    const contextOptions = {
      context: { intl, store, muiTheme },
      childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
    };
    const newSectionButton = mount(<NewSectionButton />, contextOptions);
    const sectionFormDialogue = mount(<SectionFormDialogue />, contextOptions);

    // Click 'new section' button
    const newSectionButtonNode = ReactDOM.findDOMNode(newSectionButton.find('button').node);
    ReactTestUtils.Simulate.touchTap(newSectionButtonNode);
    expect(sectionFormDialogue.find('SectionFormDialogue').first().props().visible).toBe(true);

    // Fill section form with title
    const section = { title: 'Funky section title' };
    const dialogInline = sectionFormDialogue.find('RenderToLayer').first().node.layerElement;
    const sectionForm = new ReactWrapper(dialogInline, true).find('form');
    const titleInput = sectionForm.find('input[name="title"]');
    titleInput.simulate('change', { target: { value: section.title } });

    // Submit section form
    const submitButton = sectionFormDialogue.find('FormDialogue').first().node.submitButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(submitButton));
    expect(spyCreate).toHaveBeenCalledWith({ section });
  });
});
