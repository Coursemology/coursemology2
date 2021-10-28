import { mount } from 'enzyme';
import storeCreator from 'course/lesson-plan/store';
import { UnconnectedLessonPlanShow as LessonPlanShow } from '../index';

const data = {
  groups: [
    {
      id: 'milestone-group-76',
      milestone: null,
      items: [
        {
          id: 44,
          start_at: '2017-01-04T00:00:00.000+08:00',
          itemTypeKey: 'Event',
          title: 'Ungrouped Item',
        },
      ],
    },
    {
      id: 'milestone-group-78',
      milestone: {
        id: 63,
        start_at: '2017-01-06T00:00:00.000+08:00',
        title: 'Semester 1',
      },
      items: [
        {
          id: 45,
          start_at: '2017-01-08T00:00:00.000+08:00',
          itemTypeKey: 'Event',
          title: 'First Lecture',
        },
      ],
    },
  ],
  visibility: { Event: true },
};

describe('<LessonPlanShow />', () => {
  const contextOptions = buildContextOptions(storeCreator());

  describe('when all milestones are expanded by default', () => {
    const wrapper = mount(
      <LessonPlanShow milestonesExpanded="all" {...data} />,
      contextOptions,
    );

    it('shows all visible items', () => {
      expect(wrapper.find('LessonPlanItem')).toHaveLength(2);
    });
  });

  describe('when none of the milestones are expanded by default', () => {
    const wrapper = mount(
      <LessonPlanShow milestonesExpanded="none" {...data} />,
      contextOptions,
    );

    it('shows no items', () => {
      expect(wrapper.find('LessonPlanItem')).toHaveLength(0);
    });
  });

  describe('when only of the current milestone is expanded by default', () => {
    const wrapper = mount(
      <LessonPlanShow milestonesExpanded="current" {...data} />,
      contextOptions,
    );

    it('shows items for current group', () => {
      expect(wrapper.find('LessonPlanItem')).toHaveLength(1);
    });
  });
});
