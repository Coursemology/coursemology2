import MockAdapter from 'axios-mock-adapter';
import { mount } from 'enzyme';
import { act } from 'utilities/test-utils';

import CourseAPI from 'api/course';

import { store } from '../../../store';
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

const client = CourseAPI.admin.notifications.getClient();
const mock = new MockAdapter(client);

describe('<NotificationSettings />', () => {
  it('allow emails notification settings to be set', async () => {
    const spy = jest.spyOn(CourseAPI.admin.notifications, 'update');

    mock
      .onGet(`/courses/${global.courseId}/admin/notifications`)
      .reply(200, emailSettings);

    const notificationSettings = await mount(
      <NotificationSettings />,
      buildContextOptions(store),
    );

    await act(() => Promise.resolve());
    notificationSettings.update();

    const toggles = notificationSettings.find('ForwardRef(Switch)');
    expect(toggles).toHaveLength(2);

    const toggle = toggles.first();
    toggle.props().onChange(null, true);
    const expectedPayload = {
      email_settings: {
        component: 'sample_component',
        course_assessment_category_id: 2,
        setting: 'email_for_some_event',
        phantom: true,
      },
    };
    expect(spy).toHaveBeenCalledWith(expectedPayload);
  });
});
