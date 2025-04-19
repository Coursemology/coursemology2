import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import MilestoneRow from '../MilestoneRow';

const mock = createMockAdapter(CourseAPI.lessonPlan.client);

beforeEach(() => {
  mock.reset();
});

const startAt = '03-03-2017';
const newStartAt = '03-03-2018';

const milestoneData = {
  id: 6,
  title: 'Week 1',
  start_at: new Date(startAt),
};

describe('<MilestoneRow />', () => {
  it('allows milestone start_at to be updated', async () => {
    const url = `/courses/${global.courseId}/lesson_plan/milestones/${milestoneData.id}`;
    mock.onPatch(url).reply(200);

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateMilestone');

    const page = render(
      <MilestoneRow
        groupId="group-id"
        id={milestoneData.id}
        startAt={milestoneData.start_at}
        title={milestoneData.title}
      />,
      { state: { lessonPlan: { milestones: [milestoneData] } } },
    );

    const input = await page.findByDisplayValue(startAt);

    fireEvent.change(input, { target: { value: newStartAt } });
    fireEvent.blur(input);

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(milestoneData.id, {
        lesson_plan_milestone: { start_at: new Date(newStartAt) },
      }),
    );
  });
});
