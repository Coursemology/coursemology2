import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, screen, waitFor, within } from 'test-utils';

import CourseAPI from 'api/course';
import { fetchSubmission } from 'course/assessment/submission/actions';
import toast from 'lib/hooks/toast';

import ResetSubmissionButton from '../ResetSubmissionButton';

// The failure/success toasts are asserted directly (not rendered), so a plain jest.fn() mock is
// enough — mirrors ListingPreview's test.
jest.mock('lib/hooks/toast', () => ({ success: jest.fn(), error: jest.fn() }));

// Mirrors the pattern in `SubmissionEditIndex/components/button/__test__/PublishButton.test.tsx`:
// the button only needs to dispatch the action, not run its real thunk body (which would hit
// `CourseAPI.assessment.submissions.edit` and pull in the whole submission reducer stack).
jest.mock('course/assessment/submission/actions', () => ({
  fetchSubmission: jest.fn(() => (): Promise<void> => Promise.resolve()),
}));

const mockFetchSubmission = fetchSubmission as jest.Mock;

const RESET_SUBMISSION = 'Reset submission';

const goTo = (path: string): void => window.history.pushState({}, '', path);

const renderButton = (): ReturnType<typeof render> =>
  render(<ResetSubmissionButton assessmentId="5" submissionId="9" />);

const mock = createMockAdapter(CourseAPI.marketplace.client);
beforeEach(() => {
  mock.reset();
  jest.clearAllMocks();
  goTo(`/courses/${global.courseId}/assessments/5/submissions/9/edit`);
});

it('renders the button', async () => {
  renderButton();
  expect(
    await screen.findByRole('button', { name: RESET_SUBMISSION }),
  ).toBeVisible();
});

it('asks for confirmation before resetting', async () => {
  renderButton();

  fireEvent.click(
    await screen.findByRole('button', { name: RESET_SUBMISSION }),
  );
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText(/clears all your answers/)).toBeVisible();
});

it('clears the submission, toasts success, does not navigate, and re-fetches the same submission in place', async () => {
  const url = `/courses/${global.courseId}/assessments/5/preview_submission`;
  mock.onPatch(url).reply(204);

  renderButton();

  fireEvent.click(
    await screen.findByRole('button', { name: RESET_SUBMISSION }),
  );
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(
    within(dialog).getByRole('button', { name: RESET_SUBMISSION }),
  );

  await waitFor(() => expect(mock.history.patch).toHaveLength(1));
  expect(toast.success).toHaveBeenCalled();

  // Still on the same submission edit page (no `navigate` call anywhere in this component
  // anymore), and the now-blank submission is re-fetched in place.
  expect(window.location.pathname).toBe(
    `/courses/${global.courseId}/assessments/5/submissions/9/edit`,
  );
  expect(mockFetchSubmission).toHaveBeenCalledWith('9');
});

it('toasts an error and does not re-fetch when the reset fails', async () => {
  const url = `/courses/${global.courseId}/assessments/5/preview_submission`;
  mock.onPatch(url).reply(404);

  renderButton();

  fireEvent.click(
    await screen.findByRole('button', { name: RESET_SUBMISSION }),
  );
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(
    within(dialog).getByRole('button', { name: RESET_SUBMISSION }),
  );

  await waitFor(() => expect(mock.history.patch).toHaveLength(1));
  expect(toast.error).toHaveBeenCalled();
  expect(mockFetchSubmission).not.toHaveBeenCalled();
});
