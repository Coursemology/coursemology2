import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import GradebookSettings from '../index';

const mock = createMockAdapter(CourseAPI.admin.gradebook.client);

describe('<GradebookSettings />', () => {
  it('renders the toggle unchecked when weightedViewEnabled is false', async () => {
    mock
      .onGet(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: false });

    render(<GradebookSettings />);

    const checkbox = await screen.findByRole('checkbox', {
      name: /enable weighted grade view/i,
    });
    expect(checkbox).not.toBeChecked();
  });

  it('PATCHes when toggle is checked and form submitted', async () => {
    mock
      .onGet(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: false });
    mock
      .onPatch(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: true });

    const spy = jest.spyOn(CourseAPI.admin.gradebook, 'update');

    render(<GradebookSettings />);

    const checkbox = await screen.findByRole('checkbox', {
      name: /enable weighted grade view/i,
    });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        settings_gradebook_component: { weighted_view_enabled: true },
      });
    });
  });
});
