import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/admin/store';
import LessonPlanItemSettings from '../index';

const itemSettings = [
  {
    component: 'sample_component',
    category_title: 'assessment_category_name',
    tab_title: 'tab title',
    enabled: false,
    options: { category_id: 8, tab_id: 145 },
  },
];

describe('<LessonPlanItemSettings />', () => {
  it('allow lesson plan item settings to be set', () => {
    const spy = jest.spyOn(CourseAPI.admin.lessonPlan, 'update');
    const store = storeCreator({ admin: { lessonPlanItemSettings: itemSettings } });

    const lessonPlanItemSettings = mount(
      <LessonPlanItemSettings />,
      buildContextOptions(store)
    );

    const toggles = lessonPlanItemSettings.find('Toggle');
    expect(toggles.length).toBe(1);

    const toggle = toggles.first();
    toggle.props().onToggle(null, true);
    const expectedPayload = {
      lesson_plan_settings: {
        lesson_plan_item_settings: {
          component: 'sample_component',
          tab_title: 'tab title',
          enabled: true,
          options: { category_id: 8, tab_id: 145 },
        },
      },
    };
    expect(spy).toHaveBeenCalledWith(expectedPayload);
  });
});
