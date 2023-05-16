import MockAdapter from 'axios-mock-adapter';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

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

const mock = new MockAdapter(CourseAPI.admin.lessonPlan.client);

describe('<LessonPlanSettings />', () => {
  it('allow lesson plan item settings to be set', async () => {
    const spy = jest.spyOn(CourseAPI.admin.lessonPlan, 'update');

    mock.onGet(`/courses/${global.courseId}/admin/lesson_plan`).reply(200, {
      items_settings: itemSettings,
      component_settings: {},
    });

    const page = render(<LessonPlanSettings />);

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
