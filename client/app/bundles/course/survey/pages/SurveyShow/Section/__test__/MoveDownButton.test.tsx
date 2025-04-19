import { dispatch } from 'store';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import { loadSurveys } from 'course/survey/actions/surveys';

import MoveDownButton from '../MoveDownButton';

const surveys = [
  {
    id: 3,
    sections: [{ id: 3 }, { id: 1 }, { id: 4 }, { id: 5 }, { id: 9 }],
  },
];

describe('<MoveDownButton />', () => {
  it('injects handlers that allow survey section to be moved after the following section', async () => {
    const url = `/courses/${global.courseId}/surveys/${surveys[0].id}`;
    window.history.pushState({}, '', url);
    dispatch(loadSurveys({ surveys }));

    const spyMove = jest.spyOn(CourseAPI.survey.surveys, 'reorderSections');

    const page = render(<MoveDownButton sectionIndex={3} />);
    const moveDownButton = await page.findByRole('button');

    fireEvent.click(moveDownButton);

    await waitFor(() =>
      expect(spyMove).toHaveBeenCalledWith({ ordering: [3, 1, 4, 9, 5] }),
    );
  });
});
