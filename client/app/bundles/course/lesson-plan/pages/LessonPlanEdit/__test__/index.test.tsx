import { AppState } from 'store';
import { render, waitFor } from 'test-utils';

import {
  LessonPlanGroup,
  LessonPlanItem,
  LessonPlanMilestone,
} from '../../../types';
import { LessonPlanEdit } from '../index';

const milestone: LessonPlanMilestone = {
  id: 6,
  title: 'Week 1',
  start_at: '2017-01-01T02:03:00.000+08:00',
};

const item: LessonPlanItem = {
  id: 9,
  published: false,
  title: 'Other Event',
  start_at: '2017-01-04T02:03:00.000+08:00',
  bonus_end_at: '2017-01-06T02:03:00.000+08:00',
  end_at: '2017-01-08T02:03:00.000+08:00',
  itemTypeKey: 'Event',
};

const groups: LessonPlanGroup[] = [
  {
    id: 'milestone-group-6',
    milestone,
    items: [item],
  },
];

const columnsVisible = {
  ITEM_TYPE: true,
  START_AT: true,
  BONUS_END_AT: false,
  END_AT: true,
  PUBLISHED: true,
};

// `Partial<AppState>` only allows omitting whole slices, and these tests seed
// just the few fields the component reads, so the shape is asserted.
const state = {
  lessonPlan: {
    lessonPlan: {
      visibilityByType: { Event: true },
      columnsVisible,
    },
  },
} as unknown as Partial<AppState>;

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
      expect(page.getByText(item.title)).toBeVisible();
      expect(page.getByText(milestone.title)).toBeVisible();
    });
  });
});
