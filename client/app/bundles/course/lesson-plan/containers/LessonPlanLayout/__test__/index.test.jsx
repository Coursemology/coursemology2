import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import storeCreator from 'course/lesson-plan/store';
import LessonPlanLayout from 'course/lesson-plan/containers/LessonPlanLayout';

const client = CourseAPI.lessonPlan.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
});

const lessonPlanData = {
  items: [{
    id: 9,
    published: false,
    lesson_plan_item_type: ['Other'],
    title: 'Other Event',
    description: 'BBQ',
    location: 'The pits',
    start_at: '2017-01-04T02:03:00.000+08:00',
    end_at: '2017-01-05T02:03:00.000+08:00',
    edit_path: `/courses/${courseId}/lesson_plan/events/9`,
    delete_path: `/courses/${courseId}/lesson_plan/events/9/edit`,
    materials: [{
      id: 22,
      name: 'Fire',
      url: `/courses/${courseId}/materials/folders/5/files/6`,
    }],
  }],
  milestones: [{
    id: 6,
    title: 'Post BBQ',
    start_at: '2017-01-08T02:03:00.000+08:00',
    edit_path: `/courses/${courseId}/lesson_plan/milestones/6/edit`,
    delete_path: `/courses/${courseId}/lesson_plan/milestones/6`,
  }],
};

describe('LessonPlan', () => {
  it('fetches lesson plan data and renders it', async () => {
    const store = storeCreator();
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'fetch');
    const lessonPlanUrl = `/courses/${courseId}/lesson_plan`;
    mock.onGet(lessonPlanUrl).reply(200, lessonPlanData);

    const lessonPlan = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter initialEntries={[lessonPlanUrl]}>
          <LessonPlanLayout />
        </MemoryRouter>
      </ProviderWrapper>
    );

    await sleep(1);
    expect(spy).toHaveBeenCalled();
    // A milestone should be automatically generated since the event starts before the milestone
    expect(lessonPlan.find('LessonPlanMilestone').length).toBe(2);
    expect(lessonPlan.find('LessonPlanItem').length).toBe(1);
  });
});
