import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/admin/store';
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

describe('<NotificationSettings />', () => {
  it('allow emails notification settings to be set', () => {
    const spy = jest.spyOn(CourseAPI.admin.notifications, 'update');
    const store = storeCreator({
      admin: { notificationSettings: emailSettings },
    });

    const notificationSettings = mount(
      <NotificationSettings />,
      buildContextOptions(store),
    );

    const toggles = notificationSettings.find('Toggle');
    expect(toggles.length).toBe(2);

    const toggle = toggles.first();
    toggle.props().onToggle(null, true);
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
