import { dispatch } from 'store';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import { loadSurveys } from 'course/survey/actions/surveys';

import MoveUpButton from '../MoveUpButton';

const surveys = [
  {
    id: 3,
    sections: [{ id: 3 }, { id: 1 }, { id: 4 }, { id: 5 }, { id: 9 }],
  },
];

describe('<MoveUpButton />', () => {
  it('injects handlers that allow survey section to be moved before the previous section', async () => {
    const url = `/courses/${global.courseId}/surveys/${surveys[0].id}`;
    window.history.pushState({}, '', url);
    dispatch(loadSurveys({ surveys }));

    const spyMove = jest.spyOn(CourseAPI.survey.surveys, 'reorderSections');

    const page = render(<MoveUpButton sectionIndex={3} />);
    const moveUpButton = await page.findByRole('button');

    fireEvent.click(moveUpButton);

    await waitFor(() =>
      expect(spyMove).toHaveBeenCalledWith({ ordering: [3, 1, 5, 4, 9] }),
    );
  });
});
