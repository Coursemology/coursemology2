import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/admin/store';
import LessonPlanSettings from '../index';

const itemSettings = [
  {
    component: 'course_assessments_component',
    category_title: 'assessment_category_name',
    tab_title: 'tab title',
    enabled: false,
    options: { category_id: 8, tab_id: 145 },
  },
];

describe('<LessonPlanSettings />', () => {
  it('allow lesson plan item settings to be set', () => {
    const spy = jest.spyOn(CourseAPI.admin.lessonPlan, 'update');
    const store = storeCreator({
      admin: {
        lessonPlanSettings: {
          items_settings: itemSettings,
          component_settings: {},
        },
      },
    });

    const lessonPlanSettings = mount(
      <LessonPlanSettings />,
      buildContextOptions(store)
    );

    const toggles = lessonPlanSettings.find('Toggle');
    // Enabled? and Visible? toggles.
    expect(toggles.length).toBe(2);

    const toggle = toggles.first();
    toggle.props().onToggle(null, true);
    const expectedPayload = {
      lesson_plan_settings: {
        lesson_plan_item_settings: {
          component: 'course_assessments_component',
          tab_title: 'tab title',
          enabled: true,
          options: { category_id: 8, tab_id: 145 },
        },
      },
    };
    expect(spy).toHaveBeenCalledWith(expectedPayload);
  });
});
