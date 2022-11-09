import MockAdapter from 'axios-mock-adapter';
import { mount } from 'enzyme';
import { act } from 'utilities/test-utils';

import CourseAPI from 'api/course';

import { store } from '../../../store';
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

const client = CourseAPI.admin.lessonPlan.getClient();
const mock = new MockAdapter(client);

describe('<LessonPlanSettings />', () => {
  it('allow lesson plan item settings to be set', async () => {
    const spy = jest.spyOn(CourseAPI.admin.lessonPlan, 'update');

    mock.onGet(`/courses/${global.courseId}/admin/lesson_plan`).reply(200, {
      items_settings: itemSettings,
      component_settings: {},
    });

    const lessonPlanSettings = mount(
      <LessonPlanSettings />,
      buildContextOptions(store),
    );

    await act(() => Promise.resolve());
    lessonPlanSettings.update();

    const toggles = lessonPlanSettings.find('ForwardRef(Switch)');
    // Enabled? and Visible? toggles.
    expect(toggles).toHaveLength(2);

    const toggle = toggles.first();
    toggle.props().onChange(null, true);
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
