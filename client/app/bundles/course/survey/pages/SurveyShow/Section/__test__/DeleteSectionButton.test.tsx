import { fireEvent, render } from 'test-utils';

import CourseAPI from 'api/course';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';

import DeleteSectionButton from '../DeleteSectionButton';

describe('<DeleteSectionButton />', () => {
  it('injects handlers that allow survey sections to be deleted', () => {
    const surveyId = 1;
    const sectionId = 7;
    const url = `/courses/${global.courseId}/surveys/${surveyId}`;
    const spyDelete = jest.spyOn(CourseAPI.survey.sections, 'delete');

    window.history.pushState({}, '', url);

    const page = render(
      <>
        <DeleteSectionButton sectionId={sectionId} />
        <DeleteConfirmation />
      </>,
    );

    fireEvent.click(page.getByRole('button'));
    fireEvent.click(page.getByRole('button', { name: 'Delete' }));

    expect(spyDelete).toHaveBeenCalledWith(sectionId);
  });
});
