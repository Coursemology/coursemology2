import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/admin/store';
import NotificationSettings from '../index';

const emailSettings = [
  {
    component: 'sample_component',
    component_title: 'Component Name',
    key: 'email_for_some_event',
    enabled: false,
    options: { subcomponentId: 9 },
  },
];

describe('<NotificationSettings />', () => {
  it('allow emails notification settings to be set', () => {
    const spy = jest.spyOn(CourseAPI.admin.notifications, 'update');
    const store = storeCreator({
      admin: { notificationSettings: emailSettings },
    });

    const notificationSettings = mount(
      <NotificationSettings />,
      buildContextOptions(store)
    );

    const toggles = notificationSettings.find('Toggle');
    expect(toggles.length).toBe(1);

    const toggle = toggles.first();
    toggle.props().onToggle(null, true);
    const expectedPayload = {
      notification_settings: {
        component: 'sample_component',
        key: 'email_for_some_event',
        enabled: true,
        options: { subcomponentId: 9 },
      },
    };
    expect(spy).toHaveBeenCalledWith(expectedPayload);
  });
});
