import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import ItemRow from '../ItemRow';

const mock = createMockAdapter(CourseAPI.lessonPlan.client);

const startAt = '01-01-2017';
const endAt = '02-02-2017';

const itemData = {
  id: 9,
  published: false,
  itemTypeKey: 'Other',
  title: 'Other Event',
  start_at: new Date(startAt),
  bonus_end_at: '2017-01-06T02:03:00.000+08:00',
  end_at: new Date(endAt),
};

const state = {
  lessonPlan: {
    lessonPlan: {
      visibilityByType: { [itemData.itemTypeKey]: true },
      items: [itemData],
    },
  },
};

describe('<ItemRow />', () => {
  it('shifts end dates when start date is shifted', async () => {
    const newStartAt = '02-02-2017';

    const url = `/courses/${global.courseId}/lesson_plan/items/${itemData.id}`;
    mock.onPatch(url).reply(200);

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');

    const page = render(
      <ItemRow
        bonusEndAt={itemData.bonus_end_at}
        endAt={itemData.end_at}
        id={itemData.id}
        published={itemData.published}
        startAt={itemData.start_at}
        title={itemData.title}
        type={itemData.itemTypeKey}
      />,
      { state },
    );

    const input = await page.findByDisplayValue(startAt);

    fireEvent.change(input, { target: { value: newStartAt } });
    fireEvent.blur(input);

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(itemData.id, {
        item: {
          start_at: '2017-02-01T16:00:00.000Z',
          bonus_end_at: '2017-02-06T18:03:00.000Z',
          end_at: '2017-03-05T16:00:00.000Z',
        },
      }),
    );
  });

  it('clears end date', async () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');

    const page = render(
      <ItemRow
        bonusEndAt={itemData.bonus_end_at}
        endAt={itemData.end_at}
        id={itemData.id}
        published={itemData.published}
        startAt={itemData.start_at}
        title={itemData.title}
        type={itemData.itemTypeKey}
      />,
      { state },
    );

    const input = await page.findByDisplayValue(endAt);

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(spy).toHaveBeenCalledWith(itemData.id, {
      item: { end_at: null },
    });
  });
});
