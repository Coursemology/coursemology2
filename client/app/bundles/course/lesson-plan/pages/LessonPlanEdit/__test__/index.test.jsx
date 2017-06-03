import React from 'react';
import { mount } from 'enzyme';
import storeCreator from 'course/lesson-plan/store';
import LessonPlanEdit from '../index';

const groupData = {
  id: 'milestone-group-6',
  milestone: {
    id: 6,
    title: 'Week 1',
    start_at: '2017-01-01T02:03:00.000+08:00',
  },
  items: [{
    id: 9,
    published: false,
    itemTypeKey: 'Other',
    title: 'Other Event',
    start_at: '2017-01-04T02:03:00.000+08:00',
    bonus_end_at: '2017-01-06T02:03:00.000+08:00',
    end_at: '2017-01-08T02:03:00.000+08:00',
  }],
};

describe('<LessonPlanEdit />', () => {
  it('renders item and milestone rows', () => {
    const store = storeCreator({
      groups: [groupData],
      visibilityByType: { [groupData.items[0].itemTypeKey]: true },
    });

    const lessonPlanEdit = mount(
      <LessonPlanEdit />,
      buildContextOptions(store)
    );

    expect(lessonPlanEdit.find('ItemRow').length).toBe(1);
    expect(lessonPlanEdit.find('MilestoneRow').length).toBe(1);
  });
});
