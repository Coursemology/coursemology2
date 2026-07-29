import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor, within } from 'test-utils';

import GlobalAPI from 'api';
import CourseAPI from 'api/course';

import MarketplaceUpdateBanner from '../MarketplaceUpdateBanner';

const mockUpdateToast = {
  success: jest.fn(),
  error: jest.fn(),
};

jest.mock('lib/hooks/toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  loadingToast: jest.fn(() => mockUpdateToast),
}));

const mock = createMockAdapter(CourseAPI.marketplace.client);
// pollJob polls the *jobs* endpoint, which lives on a different axios client to the marketplace API.
const jobsMock = createMockAdapter(GlobalAPI.jobs.client);

beforeEach(() => {
  mock.reset();
  jobsMock.reset();
  jest.clearAllMocks();
});

// Students have submitted work, so this copy can never be replaced in place.
const update = {
  adoptedVersionAt: '2026-06-12T00:00:00Z',
  latestVersionAt: '2026-07-24T00:00:00Z',
  canUpdateInPlace: false,
  testSubmissionCount: 0,
};

// No student has touched this copy, so the marketplace's newer content can replace it where it sits.
const updatableInPlace = {
  ...update,
  canUpdateInPlace: true,
};

// Two cuts on the same calendar day: the pair must escalate to include the time, or the banner
// would tell the manager their copy is from the same day it was superseded.
const sameDayUpdate = {
  ...update,
  adoptedVersionAt: '2026-07-24T01:00:00Z',
  latestVersionAt: '2026-07-24T07:04:00Z',
};

const APPLY_URL = `/courses/${global.courseId}/assessments/5/marketplace_adoption/apply_latest_version`;
const JOB_URL = '/jobs/9';
const REDIRECT_URL = `/courses/${global.courseId}/assessments/53`;
// What the apply endpoint answers with: the job is merely enqueued, and `jobUrl` is where its
// progress is reported.
const enqueued = { status: 'submitted', jobUrl: JOB_URL };
const UPDATE = 'Update this assessment';

// Version numbers are not a user-facing concept: the manager who copied this assessment never saw
// "v1". The banner therefore dates both content vintages instead of numbering them.
// formatLongDate('2026-07-24T00:00:00Z') under TZ=Asia/Singapore → '24 Jul 2026'.
it('dates both content vintages without version numbers, sync or behind', async () => {
  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={update} />,
  );

  const alert = await page.findByRole('alert');
  expect(alert.textContent).toContain(
    'This assessment was updated in the marketplace on 24 Jul 2026. Your copy is from 12 Jun 2026.',
  );
  expect(alert.textContent).not.toMatch(/\bv\d/);
  expect(alert.textContent).not.toMatch(/sync/i);
  expect(alert.textContent).not.toMatch(/behind/i);
});

it('escalates to the time when both vintages fall on one day', async () => {
  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={sameDayUpdate} />,
  );

  const alert = await page.findByRole('alert');
  expect(alert.textContent).toContain(
    'This assessment was updated in the marketplace on 24 Jul 2026, 3:04pm. Your copy is from 24 Jul 2026, 9:00am.',
  );
});

// The notice is a statement of fact about the copy, not a notification, so nothing may silence it.
// MUI renders Alert's close × whenever `onClose` is passed, so counting the buttons is what keeps
// the banner un-closeable — the update is the only thing it may ever offer.
it('renders the update as its only button, with nothing to close it', async () => {
  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={updatableInPlace} />,
  );

  const alert = await page.findByRole('alert');
  expect(within(alert).getAllByRole('button')).toHaveLength(1);
  expect(
    within(alert).getByRole('button', { name: UPDATE }),
  ).toBeInTheDocument();
});

// Replacing the content would destroy the students' work, so there is nothing safe to offer. An
// action-less banner is only honest if it says why — otherwise the manager hunts for a button.
it('explains why it cannot update when students have submitted work', async () => {
  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={update} />,
  );

  const alert = await page.findByRole('alert');
  expect(within(alert).queryAllByRole('button')).toHaveLength(0);
  expect(alert.textContent).toContain('can no longer be updated automatically');
  expect(alert.textContent).toContain('students have already submitted work');
  expect(alert.textContent).toMatch(/edits of your own/i);
  expect(alert.textContent).toMatch(/import this assessment .* again/i);
});

it('offers to update in place when no student has submitted work', async () => {
  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={updatableInPlace} />,
  );

  expect(await page.findByRole('button', { name: UPDATE })).toBeInTheDocument();
  expect(
    page.queryByText(/can no longer be updated automatically/),
  ).not.toBeInTheDocument();
});

it('names the test submissions the update will delete', async () => {
  const page = render(
    <MarketplaceUpdateBanner
      assessmentId={5}
      update={{ ...updatableInPlace, testSubmissionCount: 2 }}
    />,
  );

  fireEvent.click(await page.findByText(UPDATE));

  const dialog = await page.findByRole('dialog');
  expect(dialog.textContent).toContain('2 test submissions');
  expect(dialog.textContent).toContain('replaces');
});

it('omits the deletion warning when there is nothing to delete', async () => {
  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={updatableInPlace} />,
  );

  fireEvent.click(await page.findByText(UPDATE));

  const dialog = await page.findByRole('dialog');
  expect(dialog.textContent).not.toMatch(/test submission/i);
});

// The manager is about to overwrite their content, so the prompt has to name WHICH version it is
// about to bring in — the same vintage the banner is reporting.
it('names the incoming version in the confirmation', async () => {
  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={updatableInPlace} />,
  );

  fireEvent.click(await page.findByText(UPDATE));

  const dialog = await page.findByRole('dialog');
  expect(dialog.textContent).toContain('published on 24 Jul 2026');
});

it('posts the in-place update on confirm', async () => {
  mock.onPost(APPLY_URL).reply(200, enqueued);
  jobsMock.onGet(JOB_URL).reply(200, { status: 'errored' });

  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={updatableInPlace} />,
  );

  fireEvent.click(await page.findByText(UPDATE));
  const dialog = await page.findByRole('dialog');
  fireEvent.click(
    within(dialog).getByRole('button', { name: new RegExp(UPDATE) }),
  );

  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(mock.history.post[0].url).toBe(APPLY_URL);
  await waitFor(() => expect(mockUpdateToast.error).toHaveBeenCalled(), {
    timeout: 6000,
  });
});

// `canUpdateInPlace` is advisory: the endpoint re-checks for student work and answers 422 if a
// student has submitted since the page loaded. The request never reaches pollJob, so nothing else
// can unlock the prompt or retract the loading toast.
it('reports a refused update and unlocks the prompt', async () => {
  mock
    .onPost(APPLY_URL)
    .reply(422, { errors: ['Students have submitted work.'] });

  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={updatableInPlace} />,
  );

  fireEvent.click(await page.findByText(UPDATE));
  const dialog = await page.findByRole('dialog');
  const confirm = within(dialog).getByRole('button', {
    name: new RegExp(UPDATE),
  });
  fireEvent.click(confirm);

  await waitFor(() =>
    expect(mockUpdateToast.error).toHaveBeenCalledWith(
      'Could not update this assessment.',
    ),
  );
  expect(page.getByRole('dialog')).toBeInTheDocument();
  await waitFor(() => expect(confirm).toBeEnabled());
});

// The one thing that retires the banner: the copy has stopped being behind. The page still holds
// the pre-update payload, so the banner is the only thing that can notice.
it('reports completion once the in-place update job finishes', async () => {
  mock.onPost(APPLY_URL).reply(200, enqueued);
  jobsMock
    .onGet(JOB_URL)
    .reply(200, { status: 'completed', redirectUrl: REDIRECT_URL });

  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={updatableInPlace} />,
  );

  fireEvent.click(await page.findByText(UPDATE));
  const dialog = await page.findByRole('dialog');
  fireEvent.click(
    within(dialog).getByRole('button', { name: new RegExp(UPDATE) }),
  );

  await waitFor(() => expect(mockUpdateToast.success).toHaveBeenCalled(), {
    timeout: 6000,
  });
  await waitFor(() =>
    expect(page.queryByRole('alert')).not.toBeInTheDocument(),
  );
}, 10000);

it('keeps the update locked while the job is still running', async () => {
  mock.onPost(APPLY_URL).reply(200, enqueued);
  jobsMock
    .onGet(JOB_URL)
    .replyOnce(200, { status: 'submitted' })
    .onGet(JOB_URL)
    .reply(200, { status: 'errored' });

  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={updatableInPlace} />,
  );

  fireEvent.click(await page.findByText(UPDATE));
  const dialog = await page.findByRole('dialog');
  const confirm = within(dialog).getByRole('button', {
    name: new RegExp(UPDATE),
  });
  fireEvent.click(confirm);

  await waitFor(() => expect(mock.history.post).toHaveLength(1));

  // The job has not reported back, so the dialog must stay open and un-resubmittable.
  expect(confirm).toBeDisabled();
  expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();

  fireEvent.click(confirm);
  expect(mock.history.post).toHaveLength(1);

  await waitFor(() => expect(mockUpdateToast.error).toHaveBeenCalled(), {
    timeout: 6000,
  });
}, 10000);

it('reports a failed job and unlocks the dialog for a retry', async () => {
  mock.onPost(APPLY_URL).reply(200, enqueued);
  jobsMock.onGet(JOB_URL).reply(200, { status: 'errored' });

  const page = render(
    <MarketplaceUpdateBanner assessmentId={5} update={updatableInPlace} />,
  );

  fireEvent.click(await page.findByText(UPDATE));
  const dialog = await page.findByRole('dialog');
  const confirm = within(dialog).getByRole('button', {
    name: new RegExp(UPDATE),
  });
  fireEvent.click(confirm);

  await waitFor(() => expect(mockUpdateToast.error).toHaveBeenCalled(), {
    timeout: 6000,
  });

  expect(mockUpdateToast.error).toHaveBeenCalledWith(
    'Could not update this assessment.',
  );
  expect(page.getByRole('dialog')).toBeInTheDocument();
  // The banner is still there too: nothing was updated, so it is still telling the truth. Queried
  // by text rather than by role — the open dialog `aria-hidden`s the rest of the body, so its
  // `alert` role is unreachable while the retry prompt is up.
  expect(
    page.getByText(/This assessment was updated in the marketplace/),
  ).toBeInTheDocument();
  await waitFor(() => expect(confirm).toBeEnabled());
}, 10000);

it('renders nothing when there is no update', async () => {
  // The sentinel is what makes this assertion mean anything: `test-utils` mounts a translations
  // Suspense, so the alert is absent on the first tick regardless. Awaiting a sibling proves the
  // tree finished mounting; only then is the alert's absence evidence the component returned null.
  const page = render(
    <>
      <span>sentinel</span>
      <MarketplaceUpdateBanner assessmentId={5} update={null} />
    </>,
  );

  expect(await page.findByText('sentinel')).toBeInTheDocument();
  expect(page.queryByRole('alert')).not.toBeInTheDocument();
});
