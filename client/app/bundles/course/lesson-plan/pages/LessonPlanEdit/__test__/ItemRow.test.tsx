import { createMockAdapter } from 'mocks/axiosMock';
import { AppState } from 'store';
import { fireEvent, render, RenderResult, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';

import ItemRow from '../ItemRow';

const mock = createMockAdapter(CourseAPI.lessonPlan.client);

const startAt = '01-01-2017';
const endAt = '02-02-2017';

// Saves are debounced by FIELD_LONG_DEBOUNCE_DELAY_MS, so assertions have to
// outlast it.
const AFTER_DEBOUNCE = { timeout: 5000 };

const settleDebounce = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, FIELD_LONG_DEBOUNCE_DELAY_MS + 500);
  });

const itemData = {
  id: 9,
  published: false,
  itemTypeKey: 'Other',
  title: 'Other Event',
  start_at: new Date(startAt),
  bonus_end_at: '2017-01-06T02:03:00.000+08:00',
  end_at: new Date(endAt),
};

// `Partial<AppState>` only allows omitting whole slices, and these tests seed
// just the few fields the component reads, so the shape is asserted.
const state = {
  lessonPlan: {
    lessonPlan: {
      visibilityByType: { [itemData.itemTypeKey]: true },
      items: [itemData],
    },
  },
} as unknown as Partial<AppState>;

const renderItemRow = (): RenderResult =>
  render(
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<ItemRow />', () => {
  it('shifts end dates when start date is shifted', async () => {
    const newStartAt = '02-02-2017';

    const url = `/courses/${global.courseId}/lesson_plan/items/${itemData.id}`;
    mock.onPatch(url).reply(200);

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');

    const page = renderItemRow();

    const input = await page.findByDisplayValue(startAt);

    fireEvent.change(input, { target: { value: newStartAt } });
    fireEvent.blur(input);

    await waitFor(
      () =>
        expect(spy).toHaveBeenCalledWith(itemData.id, {
          item: {
            start_at: '2017-02-01T16:00:00.000Z',
            bonus_end_at: '2017-02-06T18:03:00.000Z',
            end_at: '2017-03-05T16:00:00.000Z',
          },
        }),
      AFTER_DEBOUNCE,
    );
  });

  it('clears end date', async () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');

    const page = renderItemRow();

    const input = await page.findByDisplayValue(endAt);

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    await waitFor(
      () =>
        expect(spy).toHaveBeenCalledWith(itemData.id, {
          item: { end_at: null },
        }),
      AFTER_DEBOUNCE,
    );
  });

  it('sends one request when a date is edited several times in quick succession', async () => {
    const url = `/courses/${global.courseId}/lesson_plan/items/${itemData.id}`;
    mock.onPatch(url).reply(200);

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');

    const page = renderItemRow();

    const input = await page.findByDisplayValue(endAt);

    // Typing a date passes through valid intermediate values, each of which
    // fires `onChange`. Without debouncing these become concurrent PATCHes,
    // which enqueue racing CoursewidePersonalizedTimelineUpdateJob runs.
    fireEvent.change(input, { target: { value: '03-03-2017' } });
    fireEvent.change(input, { target: { value: '04-04-2017' } });
    fireEvent.blur(input);

    await waitFor(
      () =>
        expect(spy).toHaveBeenCalledWith(itemData.id, {
          item: { end_at: '2017-04-03T16:00:00.000Z' },
        }),
      AFTER_DEBOUNCE,
    );

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('sends nothing while start date is empty', async () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');

    const page = renderItemRow();

    const input = await page.findByDisplayValue(startAt);
    fireEvent.change(input, { target: { value: '' } });

    // start_at is required, so an empty field is a transient state on the way to
    // a new date, not an update the server would accept.
    await settleDebounce();

    expect(spy).not.toHaveBeenCalled();
  });

  it('sends the start date once it is valid again', async () => {
    const url = `/courses/${global.courseId}/lesson_plan/items/${itemData.id}`;
    mock.onPatch(url).reply(200);

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');

    const page = renderItemRow();

    const input = await page.findByDisplayValue(startAt);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.change(input, { target: { value: '05-05-2017' } });

    await waitFor(
      () =>
        expect(spy).toHaveBeenCalledWith(itemData.id, {
          item: expect.objectContaining({
            start_at: '2017-05-04T16:00:00.000Z',
          }),
        }),
      AFTER_DEBOUNCE,
    );

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('retries the same value after a failed save', async () => {
    const url = `/courses/${global.courseId}/lesson_plan/items/${itemData.id}`;
    mock.onPatch(url).reply(500);

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateItem');

    const page = renderItemRow();

    const input = await page.findByDisplayValue(endAt);
    fireEvent.change(input, { target: { value: '06-06-2017' } });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1), AFTER_DEBOUNCE);

    // The store never took the rejected value, so re-entering it is a real
    // change and has to go out again — otherwise a transient failure can only be
    // retried by first picking some other date.
    const retryInput = await page.findByDisplayValue(endAt);
    fireEvent.change(retryInput, { target: { value: '06-06-2017' } });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2), AFTER_DEBOUNCE);
  });

  it('shows a saving indicator until the update resolves', async () => {
    const url = `/courses/${global.courseId}/lesson_plan/items/${itemData.id}`;
    mock.onPatch(url).reply(200);

    const page = renderItemRow();

    const input = await page.findByDisplayValue(endAt);
    fireEvent.change(input, { target: { value: '05-05-2017' } });

    expect(await page.findByTestId('CircularProgress')).toBeVisible();

    await waitFor(
      () => expect(page.queryByTestId('CircularProgress')).toBeNull(),
      AFTER_DEBOUNCE,
    );
  });
});
