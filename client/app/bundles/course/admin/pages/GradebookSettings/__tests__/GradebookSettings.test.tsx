import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import GradebookSettings from '../index';

const mock = createMockAdapter(CourseAPI.admin.gradebook.client);

describe('<GradebookSettings />', () => {
  it('shows the loading indicator before settings load', () => {
    mock
      .onGet(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: false });

    render(<GradebookSettings />);

    expect(
      screen.queryByRole('checkbox', { name: /Enable Weighted Total view/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the toggle unchecked when weightedViewEnabled is false', async () => {
    mock
      .onGet(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: false });

    render(<GradebookSettings />);

    const checkbox = await screen.findByRole('checkbox', {
      name: /Enable Weighted Total view/i,
    });
    expect(checkbox).not.toBeChecked();
  });

  it('renders the toggle checked when weightedViewEnabled is true', async () => {
    mock
      .onGet(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: true });

    render(<GradebookSettings />);

    const checkbox = await screen.findByRole('checkbox', {
      name: /Enable Weighted Total view/i,
    });
    expect(checkbox).toBeChecked();
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
      name: /Enable Weighted Total view/i,
    });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        settings_gradebook_component: { weighted_view_enabled: true },
      });
    });
  });

  it('shows a success toast after a successful save', async () => {
    mock
      .onGet(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: false });
    mock
      .onPatch(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: true });

    render(<GradebookSettings />);

    const checkbox = await screen.findByRole('checkbox', {
      name: /Enable Weighted Total view/i,
    });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(
      await screen.findByText('Your changes have been saved.'),
    ).toBeVisible();
  });

  it('PATCHes false when toggle is unchecked and form submitted', async () => {
    mock
      .onGet(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: true });
    mock
      .onPatch(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: false });

    const spy = jest.spyOn(CourseAPI.admin.gradebook, 'update');

    render(<GradebookSettings />);

    const checkbox = await screen.findByRole('checkbox', {
      name: /Enable Weighted Total view/i,
    });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        settings_gradebook_component: { weighted_view_enabled: false },
      });
    });
  });

  it('does not toast success when the save fails', async () => {
    mock
      .onGet(`/courses/${global.courseId}/admin/gradebook`)
      .reply(200, { weightedViewEnabled: false });
    mock
      .onPatch(`/courses/${global.courseId}/admin/gradebook`)
      .reply(422, { errors: { weightedViewEnabled: 'is invalid' } });

    render(<GradebookSettings />);

    const checkbox = await screen.findByRole('checkbox', {
      name: /Enable Weighted Total view/i,
    });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.queryByText('Your changes have been saved.'),
      ).not.toBeInTheDocument();
    });
  });
});
