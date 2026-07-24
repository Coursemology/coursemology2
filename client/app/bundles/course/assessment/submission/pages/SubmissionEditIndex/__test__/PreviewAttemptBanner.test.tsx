import { render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import PreviewAttemptBanner from '../PreviewAttemptBanner';
import PreviewAttemptContext from '../PreviewAttemptContext';

const mockDispatch = jest.fn();
jest.mock('lib/hooks/store', () => ({
  ...jest.requireActual('lib/hooks/store'),
  useAppDispatch: () => mockDispatch,
}));

jest.mock('course/container/CourseLoader', () => ({
  useCourseContext: () => ({ courseUrl: `/courses/${global.courseId}` }),
}));

beforeEach(() => mockDispatch.mockClear());

// TestApp always mounts a Toastify container + an I18n LoadingIndicator (removed once
// messages load), so the render container is never truly empty. The meaningful check
// is that the banner emits no Alert in the default (non-preview) context. Wait for the
// loading indicator to clear first, so this isn't vacuously true during async load.
it('renders no banner under the default (non-preview) context', async () => {
  render(<PreviewAttemptBanner />);
  await waitFor(() =>
    expect(screen.queryByTestId('CircularProgress')).not.toBeInTheDocument(),
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('renders the preview banner with Reset and Exit when isPreview', async () => {
  render(
    <PreviewAttemptContext.Provider
      value={{ isPreview: true, attemptId: 5, listingId: 7 }}
    >
      <PreviewAttemptBanner />
    </PreviewAttemptContext.Provider>,
  );

  expect(
    await screen.findByText(/you are previewing this assessment/i),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /exit/i })).toBeInTheDocument();
});

it('Reset calls the reset API and re-fetches the attempt', async () => {
  const resetSpy = jest
    .spyOn(CourseAPI.assessment.submissions, 'reset')
    .mockResolvedValue({ data: {} } as never);

  render(
    <PreviewAttemptContext.Provider
      value={{ isPreview: true, attemptId: 5, listingId: 7 }}
    >
      <PreviewAttemptBanner />
    </PreviewAttemptContext.Provider>,
  );

  (await screen.findByRole('button', { name: /reset/i })).click();

  await waitFor(() => expect(resetSpy).toHaveBeenCalledWith(5));
  // fetchSubmission is a thunk (a function); assert a function was dispatched after reset.
  await waitFor(() =>
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)),
  );
  resetSpy.mockRestore();
});
