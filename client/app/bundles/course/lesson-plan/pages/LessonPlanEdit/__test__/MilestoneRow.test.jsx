import React from 'react';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import CourseAPI from 'api/course';
import storeCreator from 'course/lesson-plan/store';
import MilestoneRow from '../MilestoneRow';

const client = CourseAPI.lessonPlan.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
});

const milestoneData = {
  id: 6,
  title: 'Week 1',
  start_at: '2017-01-04T02:03:00.000+08:00',
};

describe('<MilestoneRow />', () => {
  it('allows milestone start_at to be updated', () => {
    mock.onPatch(`/courses/${courseId}/lesson_plan/milestones/${milestoneData.id}`).reply(200);
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateMilestone');
    const store = storeCreator({ milestones: [milestoneData] });


    const table = mount(
      <table>
        <tbody>
          <MilestoneRow
            groupId="group-id"
            id={milestoneData.id}
            title={milestoneData.title}
            startAt={milestoneData.start_at}
          />
        </tbody>
      </table>,
      buildContextOptions(store)
    );

    const startAtDateInput = table.find('input[name="start_at"]').first();
    const newStartAt = '01-03-2017';
    startAtDateInput.simulate('change', { target: { value: newStartAt } });
    startAtDateInput.simulate('blur');

    expect(spy).toHaveBeenCalledWith(
      milestoneData.id,
      { lesson_plan_milestone: { start_at: new Date('2017-02-28T18:03:00.000Z') } }
    );
  });
});
