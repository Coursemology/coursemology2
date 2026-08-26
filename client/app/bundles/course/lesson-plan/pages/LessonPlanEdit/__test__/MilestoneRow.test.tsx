import { createMockAdapter } from 'mocks/axiosMock';
import { AppState } from 'store';
import { fireEvent, render, RenderResult, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';

import MilestoneRow from '../MilestoneRow';

const mock = createMockAdapter(CourseAPI.lessonPlan.client);

beforeEach(() => {
  mock.reset();
  jest.clearAllMocks();
});

const startAt = '03-03-2017';
const newStartAt = '03-03-2018';

// Saves are debounced by FIELD_LONG_DEBOUNCE_DELAY_MS, so assertions have to
// outlast it.
const AFTER_DEBOUNCE = { timeout: 5000 };

const settleDebounce = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, FIELD_LONG_DEBOUNCE_DELAY_MS + 500);
  });

const milestoneData = {
  id: 6,
  title: 'Week 1',
  start_at: new Date(startAt),
};

// `Partial<AppState>` only allows omitting whole slices, and these tests seed
// just the few fields the component reads, so the shape is asserted.
const state = {
  lessonPlan: { milestones: [milestoneData] },
} as unknown as Partial<AppState>;

const renderMilestoneRow = (): RenderResult =>
  render(
    <MilestoneRow
      groupId="group-id"
      id={milestoneData.id}
      startAt={milestoneData.start_at}
      title={milestoneData.title}
    />,
    { state },
  );

describe('<MilestoneRow />', () => {
  it('allows milestone start_at to be updated', async () => {
    const url = `/courses/${global.courseId}/lesson_plan/milestones/${milestoneData.id}`;
    mock.onPatch(url).reply(200);

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateMilestone');

    const page = renderMilestoneRow();

    const input = await page.findByDisplayValue(startAt);

    fireEvent.change(input, { target: { value: newStartAt } });
    fireEvent.blur(input);

    await waitFor(
      () =>
        expect(spy).toHaveBeenCalledWith(milestoneData.id, {
          lesson_plan_milestone: { start_at: new Date(newStartAt) },
        }),
      AFTER_DEBOUNCE,
    );
  });

  it('sends one request when the date is edited several times in quick succession', async () => {
    const url = `/courses/${global.courseId}/lesson_plan/milestones/${milestoneData.id}`;
    mock.onPatch(url).reply(200);

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateMilestone');

    const page = renderMilestoneRow();

    const input = await page.findByDisplayValue(startAt);

    fireEvent.change(input, { target: { value: '04-04-2018' } });
    fireEvent.change(input, { target: { value: newStartAt } });
    fireEvent.blur(input);

    await waitFor(
      () =>
        expect(spy).toHaveBeenCalledWith(milestoneData.id, {
          lesson_plan_milestone: { start_at: new Date(newStartAt) },
        }),
      AFTER_DEBOUNCE,
    );

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('retries the same date after a failed save', async () => {
    const url = `/courses/${global.courseId}/lesson_plan/milestones/${milestoneData.id}`;
    mock.onPatch(url).reply(500);

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateMilestone');

    const page = renderMilestoneRow();

    const input = await page.findByDisplayValue(startAt);
    fireEvent.change(input, { target: { value: newStartAt } });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1), AFTER_DEBOUNCE);

    // See ItemRow: the rejected date never reached the store, so re-entering it
    // is a real change.
    const retryInput = await page.findByDisplayValue(startAt);
    fireEvent.change(retryInput, { target: { value: newStartAt } });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2), AFTER_DEBOUNCE);
  });

  it('sends nothing while the date is empty', async () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateMilestone');

    const page = renderMilestoneRow();

    const input = await page.findByDisplayValue(startAt);
    fireEvent.change(input, { target: { value: '' } });

    // A milestone is a lesson plan item, so its start_at is required too.
    await settleDebounce();

    expect(spy).not.toHaveBeenCalled();
  });
});
