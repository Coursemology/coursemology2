import MockAdapter from 'axios-mock-adapter';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import NotificationSettings from '../index';

const emailSettings = [
  {
    component: 'sample_component',
    course_assessment_category_id: 2,
    setting: 'email_for_some_event',
    phantom: false,
    regular: true,
  },
];

const expectedPayload = {
  email_settings: {
    component: 'sample_component',
    course_assessment_category_id: 2,
    setting: 'email_for_some_event',
    phantom: true,
  },
};

const mock = new MockAdapter(CourseAPI.admin.notifications.client);

describe('<NotificationSettings />', () => {
  it('allow emails notification settings to be set', async () => {
    const spy = jest.spyOn(CourseAPI.admin.notifications, 'update');

    mock
      .onGet(`/courses/${global.courseId}/admin/notifications`)
      .reply(200, emailSettings);

    const page = render(<NotificationSettings />);

    await waitFor(() => {
      expect(page.getAllByRole('checkbox')).toHaveLength(2);
    });

    const toggle = page.getAllByRole('checkbox')[0];
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(expectedPayload);
    });
  });
});
