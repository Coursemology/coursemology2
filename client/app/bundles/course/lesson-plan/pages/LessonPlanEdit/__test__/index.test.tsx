import { render, waitFor } from 'test-utils';

import { LessonPlanEdit } from '../index';

const groups = [
  {
    id: 'milestone-group-6',
    milestone: {
      id: 6,
      title: 'Week 1',
      start_at: '2017-01-01T02:03:00.000+08:00',
    },
    items: [
      {
        id: 9,
        published: false,
        title: 'Other Event',
        start_at: '2017-01-04T02:03:00.000+08:00',
        bonus_end_at: '2017-01-06T02:03:00.000+08:00',
        end_at: '2017-01-08T02:03:00.000+08:00',
        itemTypeKey: 'Event',
      },
    ],
  },
];

const columnsVisible = {
  ITEM_TYPE: true,
  START_AT: true,
  BONUS_END_AT: false,
  END_AT: true,
  PUBLISHED: true,
};

const state = {
  lessonPlan: {
    lessonPlan: {
      visibilityByType: { Event: true },
      columnsVisible,
    },
  },
};

describe('<LessonPlanEdit />', () => {
  it('renders item and milestone rows', async () => {
    const page = render(
      <LessonPlanEdit
        canManageLessonPlan
        columnsVisible={columnsVisible}
        groups={groups}
      />,
      { state },
    );

    await waitFor(() => {
      expect(page.getByText(groups[0].items[0].title)).toBeVisible();
      expect(page.getByText(groups[0].milestone.title)).toBeVisible();
    });
  });
});
