import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/store';
import UserEmailSubscriptions from '../index';

describe('<UserEmailSubscriptions />', () => {
  it('allow emails subscription settings to be set', () => {
    const spy = jest.spyOn(CourseAPI.userEmailSubscriptions, 'update');
    const store = storeCreator({
      course: {
        userEmailSubscriptions: {
          settings: [
            {
              component: 'sample_component',
              course_assessment_category_id: null,
              setting: 'email_for_some_event',
              enabled: false,
            },
          ],
          pageFilter: {
            show_all_settings: true,
            component: null,
            category_id: null,
            setting: null,
          },
        },
      },
    });
    const userEmailSubscriptions = mount(
      <UserEmailSubscriptions />,
      buildContextOptions(store),
    );

    const toggles = userEmailSubscriptions.find('Toggle');
    expect(toggles.length).toBe(1);

    const toggle = toggles.last();
    toggle.props().onToggle(null, true);
    const expectedPayload = {
      show_all_settings: true,
      component: null,
      category_id: null,
      setting: null,
      user_email_subscriptions: {
        component: 'sample_component',
        course_assessment_category_id: null,
        setting: 'email_for_some_event',
        enabled: true,
      },
    };
    expect(spy).toHaveBeenCalledWith(expectedPayload);
  });
});
