import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import SectionFormDialogue from 'course/survey/containers/SectionFormDialogue';

import EditSectionButton from '../EditSectionButton';

const section = {
  id: 3,
  title: 'Section to be edited',
};

const newDescription = 'Added later';

const expectedPayload = {
  section: { title: section.title, description: newDescription },
};

describe('<EditSectionButton />', () => {
  it('injects handlers that allow survey sections to be edited', async () => {
    const surveyId = 1;
    const url = `/courses/${courseId}/surveys/${surveyId}`;
    window.history.pushState({}, '', url);

    const spyUpdate = jest.spyOn(CourseAPI.survey.sections, 'update');

    const page = render(
      <>
        <EditSectionButton section={section} />
        <SectionFormDialogue />
      </>,
    );

    fireEvent.click(await page.findByRole('button'));

    fireEvent.change(page.getByLabelText('Description'), {
      target: { value: newDescription },
    });

    fireEvent.click(page.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(spyUpdate).toHaveBeenCalledWith(section.id, expectedPayload);
    });
  });
});
