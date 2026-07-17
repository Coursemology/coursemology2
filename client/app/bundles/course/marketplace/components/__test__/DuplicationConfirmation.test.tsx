import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor } from 'test-utils';
import TestApp from 'utilities/TestApp';

import GlobalAPI from 'api';
import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';

import DuplicateConfirmation from '../DuplicateConfirmation';

// The toast message is a ReactNode (it carries a link), so capture it and render it rather than
// mounting a ToastContainer.
jest.mock('lib/hooks/toast', () => ({ success: jest.fn(), error: jest.fn() }));

const mock = createMockAdapter(CourseAPI.marketplace.client);
// pollJob polls the *jobs* endpoint, which lives on a different axios client to the marketplace API.
const jobsMock = createMockAdapter(GlobalAPI.jobs.client);

beforeEach(() => {
  mock.reset();
  jobsMock.reset();
  jest.clearAllMocks();
});

const LISTING_TITLE = 'Recursion Drills';
const listings = [{ id: 1, title: LISTING_TITLE }];
const url = `/courses/${global.courseId}/marketplace/listings/duplicate`;
const course = { title: 'Enrollable Course', url: '/courses/4' };
const REDIRECT_URL = '/courses/4/assessments?category=5&tab=42';
const destinationTabs = [
  { id: 41, title: 'Tutorials', categoryId: 5, categoryTitle: 'Missions' },
  { id: 42, title: 'Assignments', categoryId: 5, categoryTitle: 'Missions' },
];

const props = {
  destinationCourse: course,
  destinationTabs,
  initialDestinationTabId: 42,
  listings,
  onClose: jest.fn(),
};

const successToastTexts = (): string[] =>
  (toast.success as unknown as jest.Mock).mock.calls.map(([message]) => {
    if (typeof message === 'string') return message;

    const children = (message as { props?: { children?: unknown } }).props
      ?.children;
    if (Array.isArray(children)) {
      return children.filter((child) => typeof child === 'string').join('');
    }

    return typeof children === 'string' ? children : '';
  });

it('forgets an abandoned selection and re-seeds the initial tab when reopened', async () => {
  const page = render(<DuplicateConfirmation {...props} open />);

  expect(await page.findByRole('radio', { name: /Assignments/ })).toBeChecked();

  // The user picks a different tab, then dismisses the dialog without confirming.
  fireEvent.click(page.getByRole('radio', { name: /Tutorials/ }));
  expect(page.getByRole('radio', { name: /Tutorials/ })).toBeChecked();

  // The page keeps this component mounted and only flips `open`, so `selectedTabId` outlives the
  // close — which is the entire reason the re-seeding effect exists.
  // rerender bypasses test-utils' TestApp wrapper, so re-wrap to keep providers.
  page.rerender(
    <TestApp>
      <DuplicateConfirmation {...props} open={false} />
    </TestApp>,
  );

  page.rerender(
    <TestApp>
      <DuplicateConfirmation {...props} open />
    </TestApp>,
  );

  // Reopening starts from the tab the user launched from, not the choice they walked away from.
  expect(await page.findByRole('radio', { name: /Assignments/ })).toBeChecked();
  expect(page.getByRole('radio', { name: /Tutorials/ })).not.toBeChecked();
});

it('keeps the user’s selection across a re-render while the dialog stays open', async () => {
  const page = render(<DuplicateConfirmation {...props} open />);

  fireEvent.click(await page.findByRole('radio', { name: /Tutorials/ }));
  expect(page.getByRole('radio', { name: /Tutorials/ })).toBeChecked();

  // A parent re-render must not re-seed the selection out from under the user mid-decision.
  page.rerender(
    <TestApp>
      <DuplicateConfirmation {...props} open />
    </TestApp>,
  );

  expect(await page.findByRole('radio', { name: /Tutorials/ })).toBeChecked();
  expect(page.getByRole('radio', { name: /Assignments/ })).not.toBeChecked();
});

it('shows the destination course, the tab picker, and the duplicating list', async () => {
  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  // I18nProvider shows a LoadingIndicator until locale messages async-load; await the first query
  // to render past it, then the rest are synchronous.
  expect(await page.findByText('Duplicate items?')).toBeVisible();

  expect(page.getByText('Destination Course')).toBeVisible();
  expect(page.getByRole('link', { name: 'Enrollable Course' })).toHaveAttribute(
    'href',
    '/courses/4',
  );

  expect(page.getByText('Pick destination tab')).toBeVisible();
  expect(page.getByText('Missions')).toBeVisible();
  expect(page.getByText('Tutorials')).toBeVisible();
  expect(page.getByText('Assignments')).toBeVisible();

  expect(page.getByText('Duplicating')).toBeVisible();
  expect(page.getByText(LISTING_TITLE)).toBeVisible();
});

it('stacks destination tabs vertically with large category and tab text', async () => {
  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  expect(await page.findByText('Duplicate items?')).toBeVisible();

  expect(page.getByText('Missions').closest('div')).toHaveClass('text-xl');

  const assignments = page.getByRole('radio', { name: /Assignments/ });
  const tutorials = page.getByRole('radio', { name: /Tutorials/ });

  expect(assignments.closest('label')?.parentElement).toHaveClass(
    'flex',
    'flex-col',
    'items-start',
  );
  expect(assignments.closest('label')).toHaveClass('text-xl');
  expect(tutorials.closest('label')).toHaveClass('text-xl');
}, 10000);

// Pins the ⊘ icon and its wiring to the tooltip. NOT the tooltip copy: react-tooltip v5 renders
// nothing until shown, and hovering the anchor does not mount its content under jsdom (verified —
// `fireEvent.mouseEnter` + `findByText` on the message times out). So assert the wiring, which is
// what a dropped `tooltipId` or a dropped <Tooltip> would break.
it('badges each item as an assessment and marks it as arriving unpublished', async () => {
  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  expect(await page.findByText(LISTING_TITLE)).toBeVisible();
  expect(page.getByText('Assessment')).toBeVisible();
  expect(page.getByTestId('BlockIcon')).toHaveAttribute(
    'data-tooltip-id',
    'itemUnpublished',
  );
});

it('pre-selects the tab the user came from', async () => {
  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  expect(await page.findByRole('radio', { name: /Assignments/ })).toBeChecked();
  expect(page.getByRole('radio', { name: /Tutorials/ })).not.toBeChecked();
});

it('falls back to the first tab when the initial id is not a real tab', async () => {
  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={999}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  expect(await page.findByRole('radio', { name: /Tutorials/ })).toBeChecked();
  expect(page.getByRole('radio', { name: /Assignments/ })).not.toBeChecked();
});

it('falls back to the first tab when entered without a from_tab', async () => {
  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={null}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  expect(await page.findByRole('radio', { name: /Tutorials/ })).toBeChecked();
});

it('posts the pre-selected destination tab on confirm', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );
  fireEvent.click(await page.findByRole('button', { name: /Duplicate/ }));
  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(JSON.parse(mock.history.post[0].data)).toMatchObject({
    listing_ids: [1],
    destination_tab_id: 42,
  });
});

it('posts the newly chosen tab after the user changes the selection', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  fireEvent.click(await page.findByRole('radio', { name: /Tutorials/ }));
  fireEvent.click(page.getByRole('button', { name: /Duplicate/ }));

  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(JSON.parse(mock.history.post[0].data)).toMatchObject({
    listing_ids: [1],
    destination_tab_id: 41,
  });
});

it('omits the destination tab entirely when the course has no tabs to pick from', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });

  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={[]}
      initialDestinationTabId={null}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  expect(await page.findByText('Recursion Drills')).toBeVisible();
  expect(page.queryAllByRole('radio')).toHaveLength(0);

  fireEvent.click(page.getByRole('button', { name: /Duplicate/ }));

  await waitFor(() => expect(mock.history.post).toHaveLength(1));

  const body = JSON.parse(mock.history.post[0].data);
  expect(body).toMatchObject({ listing_ids: [1] });
  // There is no tab to name, so the key must be absent and the backend picks its own default.
  expect(body).not.toHaveProperty('destination_tab_id');
});

it('duplicates every selected listing and pluralises the completion toast', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  jobsMock.onGet('/jobs/9').reply(200, { status: 'completed' });

  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={[
        { id: 1, title: LISTING_TITLE },
        { id: 2, title: 'Graph Traversals' },
      ]}
      onClose={jest.fn()}
      open
    />,
  );

  expect(await page.findByText(LISTING_TITLE)).toBeVisible();
  expect(page.getByText('Graph Traversals')).toBeVisible();

  fireEvent.click(page.getByRole('button', { name: /Duplicate/ }));

  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(JSON.parse(mock.history.post[0].data)).toMatchObject({
    listing_ids: [1, 2],
  });

  await waitFor(
    () => expect(successToastTexts()).toContain('Assessments duplicated.'),
    { timeout: 6000 },
  );
}, 10000);

// The toast fires from pollJob's COMPLETION callback, so it must not claim the work has merely
// "started" — and it must surface the redirectUrl that callback receives, which the dialog used to
// throw away, leaving the user with no idea where the duplicate landed.
it('reports completion and links to where the assessment landed', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  jobsMock
    .onGet('/jobs/9')
    .reply(200, { status: 'completed', redirectUrl: REDIRECT_URL });

  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  fireEvent.click(await page.findByRole('button', { name: /Duplicate/ }));

  // pollJob polls every 2s — longer than waitFor's 1s default.
  await waitFor(() => expect(toast.success).toHaveBeenCalled(), {
    timeout: 6000,
  });

  const message = (toast.success as unknown as jest.Mock).mock.calls[0][0];
  const toasted = render(<div>{message}</div>);

  expect(await toasted.findByText(/Assessment duplicated\./)).toBeVisible();
  expect(toasted.queryByText(/started/i)).not.toBeInTheDocument();
  expect(
    toasted.getByRole('link', { name: 'View assessment' }),
  ).toHaveAttribute('href', REDIRECT_URL);
}, 10000);

it('closes itself once the duplication completes', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  jobsMock
    .onGet('/jobs/9')
    .reply(200, { status: 'completed', redirectUrl: REDIRECT_URL });
  const onClose = jest.fn();

  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={onClose}
      open
    />,
  );

  fireEvent.click(await page.findByRole('button', { name: /Duplicate/ }));

  // The dialog must dismiss itself on completion — the toast (with its link) is what remains.
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1), {
    timeout: 6000,
  });
}, 10000);

it('omits the link when the job returns no redirect url', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  jobsMock.onGet('/jobs/9').reply(200, { status: 'completed' });

  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  fireEvent.click(await page.findByRole('button', { name: /Duplicate/ }));

  await waitFor(() => expect(toast.success).toHaveBeenCalled(), {
    timeout: 6000,
  });

  const message = (toast.success as unknown as jest.Mock).mock.calls[0][0];
  const toasted = render(<div>{message}</div>);

  expect(await toasted.findByText(/Assessment duplicated\./)).toBeVisible();
  expect(
    toasted.queryByRole('link', { name: 'View assessment' }),
  ).not.toBeInTheDocument();
}, 10000);

// Guards the reworded failure copy — the old string was a malformed gerund
// ("Duplicating assessment failed.").
it('reports a failed duplication in plain language', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  jobsMock.onGet('/jobs/9').reply(200, { status: 'errored' });

  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  fireEvent.click(await page.findByRole('button', { name: /Duplicate/ }));

  await waitFor(() => expect(toast.error).toHaveBeenCalled(), {
    timeout: 6000,
  });

  expect(toast.error).toHaveBeenCalledWith(
    'Could not duplicate the assessment.',
  );
  expect(toast.success).not.toHaveBeenCalled();
}, 10000);

it('locks the dialog while the job runs, then unlocks it without closing if the job fails', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  jobsMock.onGet('/jobs/9').reply(200, { status: 'errored' });
  const onClose = jest.fn();

  const page = render(
    <DuplicateConfirmation
      destinationCourse={course}
      destinationTabs={destinationTabs}
      initialDestinationTabId={42}
      listings={listings}
      onClose={onClose}
      open
    />,
  );

  const duplicate = await page.findByRole('button', { name: /Duplicate/ });
  fireEvent.click(duplicate);

  // `Prompt` applies `disabled` to the cancel button as well as the primary one, so an in-flight
  // job can be neither double-submitted nor abandoned halfway.
  expect(duplicate).toBeDisabled();
  expect(page.getByRole('button', { name: 'Cancel' })).toBeDisabled();

  fireEvent.click(duplicate);

  await waitFor(() => expect(toast.error).toHaveBeenCalled(), {
    timeout: 6000,
  });

  expect(mock.history.post).toHaveLength(1);

  // A failed job must leave the dialog open and usable, so the user can retry.
  await waitFor(() => expect(duplicate).toBeEnabled());
  expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  expect(onClose).not.toHaveBeenCalled();
}, 10000);
