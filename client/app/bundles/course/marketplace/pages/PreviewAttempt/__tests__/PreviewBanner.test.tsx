import userEvent from '@testing-library/user-event';
import { createMockAdapter } from 'mocks/axiosMock';
import { render, screen, waitFor, within } from 'test-utils';

import CourseAPI from 'api/course';

import PreviewBanner from '../PreviewBanner';

// The Duplicate flow reads the destination course from the course outlet context; there is no
// CourseLayout outlet in the test, so mock the hook (mirrors ListingPreview/__test__).
jest.mock('../../../../container/CourseLoader', () => ({
  useCourseContext: (): { courseTitle: string; courseUrl: string } => ({
    courseTitle: 'Test Course',
    courseUrl: `/courses/${global.courseId}`,
  }),
}));

const mock = createMockAdapter(CourseAPI.marketplace.client);

const LISTING_ID = 70;
const ATTEMPT_ID = 42;
const LISTING_TITLE = 'Mission 1 — Variables & Control Flow';
const LISTING_URL = `/courses/${global.courseId}/marketplace/listings/${LISTING_ID}`;
const RESET_URL = `/courses/${global.courseId}/marketplace/attempt/${ATTEMPT_ID}/reset`;

const listingReply = {
  id: LISTING_ID,
  title: LISTING_TITLE,
  destinationTabs: [],
  description: '',
  gradingMode: 'manual',
  baseExp: 0,
  bonusExp: 0,
  showMcqMrqSolution: false,
  showRubricToStudents: false,
  gradedTestCases: '',
  typeCounts: {},
  questions: [],
};

// A successful reset calls window.location.reload(); jsdom leaves that unimplemented (a harmless
// console notice, not a throw) and locks window.location so it can't be spied. We therefore assert
// the reset request itself, not the reload call.

beforeEach(() => {
  mock.reset();
  mock.onGet(LISTING_URL).reply(200, listingReply);
});

const renderBanner = (): void => {
  render(<PreviewBanner attemptId={ATTEMPT_ID} listingId={LISTING_ID} />, {
    at: [
      `/courses/${global.courseId}/marketplace/listings/${LISTING_ID}/attempt`,
    ],
  });
};

it('tells the previewer the sandbox is separate from their own courses', async () => {
  renderBanner();

  expect(
    await screen.findByText(/private sandbox, separate from your own courses/i),
  ).toBeVisible();
});

it('offers Reset attempt to the left of Duplicate Assessment', async () => {
  renderBanner();

  const reset = await screen.findByRole('button', { name: /reset attempt/i });
  const duplicate = screen.getByRole('button', {
    name: /duplicate assessment/i,
  });
  expect(reset).toBeVisible();
  expect(duplicate).toBeVisible();
  // Reset precedes Duplicate in the DOM (i.e. renders to its left).
  const labels = screen.getAllByRole('button').map((b) => b.textContent ?? '');
  expect(labels.findIndex((l) => /reset attempt/i.test(l))).toBeLessThan(
    labels.findIndex((l) => /duplicate assessment/i.test(l)),
  );
});

it('confirms before resetting, then resets the attempt and reloads', async () => {
  const user = userEvent.setup();
  mock.onPost(RESET_URL).reply(200, {});
  renderBanner();

  await user.click(
    await screen.findByRole('button', { name: /reset attempt/i }),
  );

  // Confirmation dialog — click its primary (scoped to the dialog to avoid the banner button).
  const dialog = await screen.findByRole('dialog');
  await user.click(
    within(dialog).getByRole('button', { name: /reset attempt/i }),
  );

  await waitFor(() =>
    expect(
      mock.history.post.some((r) =>
        r.url?.endsWith(`/attempt/${ATTEMPT_ID}/reset`),
      ),
    ).toBe(true),
  );
});

it('does not reset when the confirmation is dismissed', async () => {
  const user = userEvent.setup();
  mock.onPost(RESET_URL).reply(200, {});
  renderBanner();

  await user.click(
    await screen.findByRole('button', { name: /reset attempt/i }),
  );
  const dialog = await screen.findByRole('dialog');
  await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

  expect(
    mock.history.post.some((r) =>
      r.url?.endsWith(`/attempt/${ATTEMPT_ID}/reset`),
    ),
  ).toBe(false);
});

it('opens the Duplicate Assessment flow into the current course', async () => {
  const user = userEvent.setup();
  renderBanner();

  const duplicate = await screen.findByRole('button', {
    name: /duplicate assessment/i,
  });
  // Enabled only once the listing (title + destination tabs) has loaded.
  await waitFor(() => expect(duplicate).toBeEnabled());
  await user.click(duplicate);

  expect(await screen.findByText(/duplicate items\?/i)).toBeVisible();
  expect(screen.getByText('Test Course')).toBeVisible();
});
