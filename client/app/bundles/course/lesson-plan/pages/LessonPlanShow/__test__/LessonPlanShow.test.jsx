import { render, waitFor } from 'test-utils';

import { LessonPlanShow } from '../index';

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
  isLoading: false,
};

describe('<LessonPlanShow />', () => {
  describe('when all milestones are expanded by default', () => {
    it('shows all visible items', async () => {
      const page = render(
        <LessonPlanShow
          canManageLessonPlan
          milestonesExpanded="all"
          {...data}
        />,
      );

      await waitFor(() => {
        data.groups.forEach((group) =>
          group.items.forEach((item) =>
            expect(page.getByText(item.title)).toBeVisible(),
          ),
        );
      });
    });
  });

  describe('when none of the milestones are expanded by default', () => {
    it('shows no items', async () => {
      const page = render(
        <LessonPlanShow
          canManageLessonPlan
          milestonesExpanded="none"
          {...data}
        />,
      );
      await waitFor(() => {
        data.groups.forEach((group) =>
          group.items.forEach((item) =>
            expect(page.queryByText(item.title)).not.toBeInTheDocument(),
          ),
        );
      });
    });
  });

  describe('when only one of the current milestone is expanded by default', () => {
    it('shows items for current group', async () => {
      const page = render(
        <LessonPlanShow
          canManageLessonPlan
          milestonesExpanded="current"
          {...data}
        />,
      );

      const hiddenItem = data.groups[0].items[0].title;
      const shownItem = data.groups[1].items[0].title;

      await waitFor(() => {
        expect(page.queryByText(hiddenItem)).not.toBeInTheDocument();
        expect(page.getByText(shownItem)).toBeVisible();
      });
    });
  });
});
