import MockAdapter from 'axios-mock-adapter';
import { render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import LessonPlanLayout from '..';

const client = CourseAPI.lessonPlan.client;
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
});

const lessonPlanData = {
  items: [
    {
      id: 9,
      eventId: 8,
      published: false,
      lesson_plan_item_type: ['Other'],
      title: 'Other Event',
      description: 'BBQ',
      location: 'The pits',
      start_at: '2017-01-04T02:03:00.000+08:00',
      end_at: '2017-01-05T02:03:00.000+08:00',
      materials: [
        {
          id: 22,
          name: 'Fire',
          url: `/courses/${global.courseId}/materials/folders/5/files/6`,
        },
      ],
    },
  ],
  milestones: [
    {
      id: 6,
      title: 'Post BBQ',
      start_at: '2017-01-08T02:03:00.000+08:00',
    },
  ],
  visibilitySettings: [{ setting_key: ['Assessment'], visible: true }],
  flags: {
    canManageLessonPlan: false,
    milestonesExpanded: 'all',
  },
};

describe('LessonPlan', () => {
  it('fetches lesson plan data and renders action buttons', async () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'fetch');
    const lessonPlanUrl = `/courses/${global.courseId}/lesson_plan`;
    mock.onGet(lessonPlanUrl).reply(200, lessonPlanData);

    const lessonPlan = render(<LessonPlanLayout />);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    expect(lessonPlan.getByRole('button', { name: 'Filter' })).toBeVisible();

    expect(
      lessonPlan.getByRole('button', { name: 'Go To Milestone' }),
    ).toBeVisible();
  });
});
