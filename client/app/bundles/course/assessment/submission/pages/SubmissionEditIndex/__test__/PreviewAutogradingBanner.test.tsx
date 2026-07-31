import { createMockAdapter } from 'mocks/axiosMock';
import { render, waitFor } from 'test-utils';

import GlobalAPI from 'api';
import { fetchSubmission } from 'course/assessment/submission/actions';
import { useCourseContext } from 'course/container/CourseLoader';
import { setNotification } from 'lib/actions';

import PreviewAutogradingBanner from '../PreviewAutogradingBanner';

jest.mock('course/assessment/submission/actions', () => ({
  fetchSubmission: jest.fn(() => (): Promise<void> => Promise.resolve()),
}));

jest.mock('course/container/CourseLoader', () => ({
  useCourseContext: jest.fn(),
}));

jest.mock('lib/actions', () => ({
  setNotification: jest.fn(() => (): void => {}),
}));

jest.mock('lib/helpers/url-helpers', () => ({
  ...jest.requireActual('lib/helpers/url-helpers'),
  getSubmissionId: (): string => '42',
}));

// The banner polls the *jobs* endpoint, which lives on its own axios client.
const jobsMock = createMockAdapter(GlobalAPI.jobs.client);

const mockFetchSubmission = fetchSubmission as jest.Mock;
const mockUseCourseContext = useCourseContext as jest.Mock;
const mockSetNotification = setNotification as jest.Mock;

const stateWith = (previewAutograding: object): object => ({
  assessments: { submission: { previewAutograding } },
});

const POLLING = { jobUrl: '/jobs/9', status: 'polling' };

// The banner polls every 2s, which is longer than waitFor's 1s default — every wait here needs an
// explicit longer timeout, and every test needs a raised jest timeout.
const POLL_WAIT = { timeout: 8000 };

const settle = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });

beforeEach(() => {
  jobsMock.reset();
  jest.clearAllMocks();
  mockFetchSubmission.mockImplementation(
    () => (): Promise<void> => Promise.resolve(),
  );
  mockUseCourseContext.mockReturnValue({ isPreview: true });
});

describe('PreviewAutogradingBanner', () => {
  it('renders nothing when no auto-grading is in flight', async () => {
    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith({ jobUrl: null, status: 'idle' }),
    });

    await settle(3000);

    expect(page.queryByText(/Auto-marking/)).not.toBeInTheDocument();
    expect(jobsMock.history.get).toHaveLength(0);
  }, 10000);

  it('tells the previewer that auto-marking is running while the job is pending', async () => {
    jobsMock.onGet('/jobs/9').reply(200, { status: 'submitted' });

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    expect(await page.findByText(/Auto-marking is running/)).toBeVisible();
    await waitFor(
      () => expect(jobsMock.history.get.length).toBeGreaterThan(0),
      POLL_WAIT,
    );
    expect(mockFetchSubmission).not.toHaveBeenCalled();
  }, 15000);

  it('refetches the submission and clears itself when the job completes', async () => {
    jobsMock.onGet('/jobs/9').reply(200, { status: 'completed' });

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    await waitFor(
      () =>
        expect(mockFetchSubmission).toHaveBeenCalledWith(
          '42',
          undefined,
          expect.any(Function),
        ),
      POLL_WAIT,
    );
    await waitFor(
      () =>
        expect(
          page.queryByText(/Auto-marking is running/),
        ).not.toBeInTheDocument(),
      POLL_WAIT,
    );
    expect(mockSetNotification).toHaveBeenCalled();
  }, 15000);

  it('tells the previewer to refresh when the job errors', async () => {
    jobsMock
      .onGet('/jobs/9')
      .reply(200, { status: 'errored', message: 'boom' });

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    expect(
      await page.findByText(/Auto-marking did not finish/, {}, POLL_WAIT),
    ).toBeVisible();
    expect(mockFetchSubmission).toHaveBeenCalledWith(
      '42',
      undefined,
      expect.any(Function),
    );
  }, 15000);

  it('tells the previewer to refresh when the job request itself fails', async () => {
    jobsMock.onGet('/jobs/9').networkError();

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    expect(
      await page.findByText(/Auto-marking did not finish/, {}, POLL_WAIT),
    ).toBeVisible();
  }, 15000);

  it('keeps showing the failure notice without polling further', async () => {
    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith({ jobUrl: null, status: 'failed' }),
    });

    expect(await page.findByText(/Auto-marking did not finish/)).toBeVisible();

    await settle(3000);

    expect(jobsMock.history.get).toHaveLength(0);
  }, 10000);

  it('renders nothing and never polls outside a preview course', async () => {
    mockUseCourseContext.mockReturnValue({ isPreview: false });
    jobsMock.onGet('/jobs/9').reply(200, { status: 'submitted' });

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    await settle(3000);

    expect(page.queryByText(/Auto-marking/)).not.toBeInTheDocument();
    expect(jobsMock.history.get).toHaveLength(0);
  }, 10000);

  it('renders nothing when mounted outside CourseContainer entirely', async () => {
    mockUseCourseContext.mockReturnValue(undefined);
    jobsMock.onGet('/jobs/9').reply(200, { status: 'submitted' });

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    await settle(3000);

    expect(page.queryByText(/Auto-marking/)).not.toBeInTheDocument();
    expect(jobsMock.history.get).toHaveLength(0);
  }, 10000);

  // Regression guard: `pollJob`'s default export orphans pollers across navigation (see its own
  // docstring), and this feature has already shipped that bug once as stray `/assessments/null`
  // requests. Deleting the effect's cleanup must fail this example.
  it('stops polling once the page unmounts', async () => {
    jobsMock.onGet('/jobs/9').reply(200, { status: 'submitted' });

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    await waitFor(
      () => expect(jobsMock.history.get.length).toBeGreaterThan(0),
      POLL_WAIT,
    );

    page.unmount();
    const callsAtUnmount = jobsMock.history.get.length;

    await settle(5000);

    expect(jobsMock.history.get).toHaveLength(callsAtUnmount);
  }, 20000);

  // A purge destroys the snapshot assessment and cascades its submission. The jobs row survives, so
  // the poll succeeds and only the refetch 404s.
  it('says the preview is gone rather than telling the previewer to refresh, when the submission was purged', async () => {
    jobsMock.onGet('/jobs/9').reply(200, { status: 'completed' });
    mockFetchSubmission.mockImplementation(
      (_id: string, _onSession: unknown, onError?: (e: unknown) => void) =>
        (): Promise<void> => {
          onError?.({ response: { status: 404 } });
          return Promise.resolve();
        },
    );

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    expect(
      await page.findByText(/no longer available/, {}, POLL_WAIT),
    ).toBeVisible();
    expect(page.queryByText(/Refresh this page/)).not.toBeInTheDocument();
    expect(mockSetNotification).not.toHaveBeenCalled();
  }, 15000);

  // The likelier purge path: the assessment went away before the job ran, so the job errored on
  // ActiveJob deserialization rather than completing.
  it('promotes an errored job to gone when the submission was purged', async () => {
    jobsMock
      .onGet('/jobs/9')
      .reply(200, { status: 'errored', message: 'boom' });
    mockFetchSubmission.mockImplementation(
      (_id: string, _onSession: unknown, onError?: (e: unknown) => void) =>
        (): Promise<void> => {
          onError?.({ response: { status: 404 } });
          return Promise.resolve();
        },
    );

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    expect(
      await page.findByText(/no longer available/, {}, POLL_WAIT),
    ).toBeVisible();
  }, 15000);

  // Guards the `=== 404` check specifically: any other failure is an ordinary failure, not a purge.
  it('keeps the ordinary failure notice when the refetch fails for a non-404 reason', async () => {
    jobsMock
      .onGet('/jobs/9')
      .reply(200, { status: 'errored', message: 'boom' });
    mockFetchSubmission.mockImplementation(
      (_id: string, _onSession: unknown, onError?: (e: unknown) => void) =>
        (): Promise<void> => {
          onError?.({ response: { status: 500 } });
          return Promise.resolve();
        },
    );

    const page = render(<PreviewAutogradingBanner />, {
      state: stateWith(POLLING),
    });

    expect(
      await page.findByText(/Auto-marking did not finish/, {}, POLL_WAIT),
    ).toBeVisible();
    expect(page.queryByText(/no longer available/)).not.toBeInTheDocument();
  }, 15000);
});
