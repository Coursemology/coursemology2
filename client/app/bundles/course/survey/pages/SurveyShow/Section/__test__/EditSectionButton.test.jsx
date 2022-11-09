import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import CourseAPI from 'api/course';
import SectionFormDialogue from 'course/survey/containers/SectionFormDialogue';
import storeCreator from 'course/survey/store';

import EditSectionButton from '../EditSectionButton';

const section = {
  id: 3,
  title: 'Section to be edited',
};

describe('<EditSectionButton />', () => {
  it('injects handlers that allow survey sections to be edited', async () => {
    const surveyId = 1;
    const spyUpdate = jest.spyOn(CourseAPI.survey.sections, 'update');

    window.history.pushState(
      {},
      '',
      `/courses/${courseId}/surveys/${surveyId}`,
    );
    const contextOptions = buildContextOptions(storeCreator({}));
    const sectionFormDialogue = mount(<SectionFormDialogue />, contextOptions);
    const editSectionButton = mount(
      <EditSectionButton section={section} />,
      contextOptions,
    );
    editSectionButton.find('button').simulate('click');
    sectionFormDialogue.update();

    const newDescription = 'Added later';
    const sectionForm = sectionFormDialogue.find('form');
    const descriptionInput = sectionForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: newDescription } });
    await sleep(0.01);

    await act(async () => {
      sectionForm.simulate('submit');
    });

    const expectedPayload = {
      section: { title: section.title, description: newDescription },
    };
    expect(spyUpdate).toHaveBeenCalledWith(section.id, expectedPayload);
  });
});
