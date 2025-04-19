import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import SectionFormDialogue from 'course/survey/containers/SectionFormDialogue';

import NewSectionButton from '../NewSectionButton';

const section = { title: 'Funky section title', description: 'description' };

describe('<NewSectionButton />', () => {
  it('opens a form dialog that submits the new survey form data', async () => {
    const spyCreate = jest.spyOn(CourseAPI.survey.sections, 'create');
    const page = render(
      <>
        <NewSectionButton />
        <SectionFormDialogue />
      </>,
    );

    const newSectionButton = await page.findByRole('button');
    fireEvent.click(newSectionButton);

    const titleField = page.getByLabelText('Title', { exact: false });
    fireEvent.change(titleField, { target: { value: section.title } });

    const descriptionField = page.getByLabelText('Description');
    fireEvent.change(descriptionField, {
      target: { value: section.description },
    });

    fireEvent.click(page.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(spyCreate).toHaveBeenCalledWith({ section });
    });
  });
});
