import { createMockAdapter } from 'mocks/axiosMock';
import { act, render, waitFor, within } from 'test-utils';
import TestApp from 'utilities/TestApp';

import SystemAPI from 'api/system';

import MarketplaceListingShow from '../MarketplaceListingShow';

const SHOW_URL = '/admin/marketplace_listings/1';
const SECOND_SHOW_URL = '/admin/marketplace_listings/2';
const CONTAINER_V1 = 'http://preview.example.org/courses/7/assessments/101';
const CONTAINER_V2 = 'http://preview.example.org/courses/7/assessments/102';
const LISTING_TITLE = 'Recursion Drill';
const SECOND_LISTING_TITLE = 'Sorting Drill';
const MARKETPLACE_HOSTED = 'Marketplace-hosted';
const MARKETPLACE_HOSTED_HINT =
  "This listing's source assessment lives in the marketplace's own preview course, not in the course it was originally published from - the original was deleted, so the marketplace saved one to keep publishing from.";
const AUTHORING_URL = 'http://main.example.org/courses/9/assessments/12';
const CONTAINER_AUTHORING_URL =
  'http://preview.example.org/courses/7/assessments/200';
const OPEN_ACTION = 'Open source assessment';
const DELETED_SUFFIX = '(deleted)';
const SOURCE_COURSE_NAME = 'Intro to Programming';
const VERSION_HISTORY = 'Version history';
const INSTANCE_NAME = 'Main Campus';
const ASSESSMENT_DELETED_HINT =
  'The assessment this listing was originally published from has been deleted. The listing is unaffected: it goes on serving its last published version, and a source assessment is saved in the marketplace’s preview course so new versions can still be published.';
let mockListingId = '1';

// Under TZ=Asia/Singapore these render as '15 Jan 2026, 6:00pm' and '20 Jun 2026, 6:00pm'.
const V1_AT = '2026-01-15T10:00:00.000Z';
const V1_LABEL = '15 Jan 2026, 6:00pm';
const V2_AT = '2026-06-20T10:00:00.000Z';
const V2_LABEL = '20 Jun 2026, 6:00pm';

// `TestApp` mounts the component directly inside a `MemoryRouter` with no matching
// `<Route path=":listingId">`, so `useParams()` would otherwise be empty and the page would never
// fetch. Mock it to supply the route param — the same idiom as
// `course/marketplace/pages/ListingPreview/__test__/index.test.tsx` and
// `survey/pages/ResponseIndex/__test__`.
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: (): { listingId: string } => ({ listingId: mockListingId }),
}));

const mock = createMockAdapter(SystemAPI.admin.client);

beforeEach(() => {
  mock.reset();
  mockListingId = '1';
});

const detail = (overrides = {}): unknown => ({
  id: 1,
  title: LISTING_TITLE,
  currentVersionPublishedAt: V2_AT,
  state: 'published',
  marketplaceHosted: false,
  sourceAssessmentDeleted: false,
  sourceCourseDeleted: false,
  authoringAssessmentUrl: AUTHORING_URL,
  sourceCourseId: 9,
  sourceCourseName: SOURCE_COURSE_NAME,
  sourceInstanceName: INSTANCE_NAME,
  sourceInstanceHost: 'main.example.org',
  sourceStartedAt: '2026-01-15T10:00:00.000Z',
  sourceEndedAt: '2026-05-20T10:00:00.000Z',
  versions: [
    {
      publishedAt: V1_AT,
      publisherName: 'Ada Admin',
      isCurrent: false,
      snapshotUrl: CONTAINER_V1,
    },
    {
      publishedAt: V2_AT,
      publisherName: 'Bob Admin',
      isCurrent: true,
      snapshotUrl: CONTAINER_V2,
    },
  ],
  adoptions: [
    {
      id: 5,
      destinationCourseId: 77,
      destinationCourseName: 'Adopting Course',
      destinationCourseHost: 'other.example.org',
      adoptedVersionAt: V1_AT,
      adoptedAt: '2026-02-01T10:00:00.000Z',
      snapshotUrl: CONTAINER_V1,
    },
  ],
  ...overrides,
});

const renderPage = (): ReturnType<typeof render> =>
  render(<MarketplaceListingShow />, { at: [SHOW_URL] });

it('names the listing and its provenance', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(page.getByText(SOURCE_COURSE_NAME)).toBeInTheDocument();
  expect(page.getByText(new RegExp(INSTANCE_NAME))).toBeInTheDocument();
});

// The heading is the LISTING's identity, so it is plain text in every state — never a link (whose
// typography would shrink it inside the h6) and never struck through (which would say the listing is
// dead while it serves normally). "Open source assessment" beside it is the entrance.
it('keeps the heading plain text and puts the entrance beside it', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(
    page.queryByRole('link', { name: LISTING_TITLE }),
  ).not.toBeInTheDocument();
  expect(page.getByRole('link', { name: OPEN_ACTION })).toHaveAttribute(
    'href',
    AUTHORING_URL,
  );
});

it('links the source course on its own instance host', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(
    await page.findByRole('link', { name: SOURCE_COURSE_NAME }),
  ).toHaveAttribute('href', '//main.example.org/courses/9/assessments');
});

// Same rule as the index table's Instance column: the instance is only reachable on its own host.
it('links the instance to its own host', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(
    await page.findByRole('link', { name: INSTANCE_NAME }),
  ).toHaveAttribute('href', '//main.example.org/');
});

it('leaves the instance as plain text when none was recorded', async () => {
  mock
    .onGet(SHOW_URL)
    .reply(200, detail({ sourceInstanceName: null, sourceInstanceHost: null }));

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(
    page.queryByRole('link', { name: INSTANCE_NAME }),
  ).not.toBeInTheDocument();
});

// Stated on the provenance line under its own label, NOT on the heading: a label carries the meaning
// without a strikethrough and without repeating the title, which the heading already shows.
it('reports a deleted original on the provenance line, leaving the heading intact', async () => {
  mock.onGet(SHOW_URL).reply(
    200,
    detail({
      sourceAssessmentDeleted: true,
      marketplaceHosted: true,
      authoringAssessmentUrl: CONTAINER_AUTHORING_URL,
    }),
  );

  const page = renderPage();

  const heading = await page.findByText(LISTING_TITLE);
  expect(heading).not.toHaveClass('line-through');
  expect(page.getByText(/Original assessment/)).toBeInTheDocument();
  expect(page.getByLabelText(ASSESSMENT_DELETED_HINT)).toHaveTextContent(
    'deleted',
  );
  // The entrance follows the source assessment to the preview course.
  expect(page.getByRole('link', { name: OPEN_ACTION })).toHaveAttribute(
    'href',
    CONTAINER_AUTHORING_URL,
  );
});

it('says nothing about the original while it still exists', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(page.queryByText(/Original assessment/)).not.toBeInTheDocument();
});

// The course NAME survives its deletion and is worth keeping on screen, so unlike the assessment it
// is struck through in place rather than replaced by a bare "deleted".
it('strikes out and unlinks a deleted source course', async () => {
  mock.onGet(SHOW_URL).reply(
    200,
    detail({
      sourceAssessmentDeleted: true,
      sourceCourseDeleted: true,
      sourceCourseId: null,
      authoringAssessmentUrl: null,
    }),
  );

  const page = renderPage();

  expect(await page.findByText(SOURCE_COURSE_NAME)).toHaveClass('line-through');
  expect(
    page.queryByRole('link', { name: SOURCE_COURSE_NAME }),
  ).not.toBeInTheDocument();
  // Nothing to open while the listing has no source assessment at all.
  expect(
    page.queryByRole('link', { name: OPEN_ACTION }),
  ).not.toBeInTheDocument();
  expect(page.getByText(DELETED_SUFFIX, { exact: false })).toBeInTheDocument();
});

// The Source course line keeps naming the ORIGIN course after a rebuild — that provenance is a
// historical fact the rebuild leaves alone — so the marker is what stops this page reading as though
// the source assessment were still sitting in that course.
it('marks a marketplace-hosted listing alongside its state, keeping the origin provenance', async () => {
  mock.onGet(SHOW_URL).reply(200, detail({ marketplaceHosted: true }));

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(page.getByText('Published')).toBeInTheDocument();
  expect(page.getByLabelText(MARKETPLACE_HOSTED_HINT)).toHaveTextContent(
    MARKETPLACE_HOSTED,
  );
  expect(page.getByText(SOURCE_COURSE_NAME)).toBeInTheDocument();
});

it('shows no marketplace-hosted marker for a listing with its own source course', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(page.queryByText(MARKETPLACE_HOSTED)).not.toBeInTheDocument();
});

// Every version is listed, including the current one — the point of the page is the whole chain.
it('lists every version with its publisher and marks the current one', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();

  const history = page.getByRole('table', { name: VERSION_HISTORY });
  const rows = within(history).getAllByRole('row').slice(1);

  expect(rows).toHaveLength(2);
  expect(within(rows[0]).getByText(V1_LABEL)).toBeInTheDocument();
  expect(within(rows[0]).getByText('Ada Admin')).toBeInTheDocument();
  expect(within(rows[1]).getByText(V2_LABEL)).toBeInTheDocument();
  expect(within(rows[1]).getByText('Bob Admin')).toBeInTheDocument();

  // Only the served version carries the badge. "Latest", not "Current": the adoptions table below
  // has a "Version held" column, so *current* invites the question "current to whom?" — and the
  // container's chips and the `apply_latest_version` route already say latest.
  expect(within(rows[1]).getByText('Latest')).toBeInTheDocument();
  expect(within(rows[0]).queryByText('Latest')).not.toBeInTheDocument();

  // The Version column now carries the publish datetime, so a separate Published column would
  // repeat it verbatim.
  expect(within(rows[0]).getAllByRole('cell')).toHaveLength(3);
});

// The snapshot lives in the container course on the preview host, and the admin returns to this page
// afterwards — so the link must not replace it.
it('links each version to its container snapshot in a new tab', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();

  const history = page.getByRole('table', { name: VERSION_HISTORY });
  const link = within(history).getByRole('link', {
    name: `View ${V1_LABEL} content`,
  });
  expect(link).toHaveAttribute('href', CONTAINER_V1);
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

it('renders a version with no surviving snapshot as plain text, not a link', async () => {
  mock.onGet(SHOW_URL).reply(200, {
    ...(detail() as object),
    versions: [
      {
        publishedAt: V1_AT,
        publisherName: 'Ada Admin',
        isCurrent: true,
        snapshotUrl: null,
      },
    ],
  });

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(
    within(page.getByRole('table', { name: VERSION_HISTORY })).queryByRole(
      'link',
      { name: `View ${V1_LABEL} content` },
    ),
  ).not.toBeInTheDocument();
});

it('reports which version each adopting course holds', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();

  const adoptions = page.getByRole('table', { name: 'Adoptions' });
  const rows = within(adoptions).getAllByRole('row').slice(1);

  expect(rows).toHaveLength(1);
  expect(within(rows[0]).getByText('Adopting Course')).toBeInTheDocument();
  expect(within(rows[0]).getByText(V1_LABEL)).toBeInTheDocument();
});

// Unusual but valid, so it reports rather than the section vanishing.
it('shows an inline empty state when nothing has adopted the listing', async () => {
  mock.onGet(SHOW_URL).reply(200, { ...(detail() as object), adoptions: [] });

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(
    page.getByText('No courses have adopted this listing yet.'),
  ).toBeInTheDocument();
  expect(
    page.queryByRole('table', { name: 'Adoptions' }),
  ).not.toBeInTheDocument();
});

// Losing the origin removes the authoring copy, not the history — and not the listing's place on the
// marketplace either, since the copy is rebuilt automatically.
it('still renders the history, and stays published, when the origin was deleted', async () => {
  mock.onGet(SHOW_URL).reply(200, {
    ...(detail() as object),
    sourceAssessmentDeleted: true,
    marketplaceHosted: true,
    authoringAssessmentUrl: CONTAINER_AUTHORING_URL,
  });

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(page.getByText('Published')).toBeInTheDocument();
  expect(
    within(page.getByRole('table', { name: VERSION_HISTORY })).getAllByRole(
      'row',
    ),
  ).toHaveLength(3);
});

it('reports an unlisted listing as unlisted', async () => {
  mock.onGet(SHOW_URL).reply(200, {
    ...(detail() as object),
    state: 'unlisted',
  });

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();
  expect(page.getByText('Unlisted')).toBeInTheDocument();
});

it('renders an empty history without crashing when there is no version', async () => {
  mock.onGet(SHOW_URL).reply(200, {
    ...(detail() as object),
    currentVersionPublishedAt: null,
    versions: [],
  });

  const page = renderPage();

  expect(
    await page.findByText('No versions have been published yet.'),
  ).toBeInTheDocument();
});

it('uses an em dash for unknown values', async () => {
  mock.onGet(SHOW_URL).reply(200, {
    ...(detail() as object),
    title: null,
    sourceCourseName: null,
    sourceInstanceName: null,
    sourceStartedAt: null,
    sourceEndedAt: null,
    versions: [
      {
        publishedAt: null,
        publisherName: null,
        isCurrent: true,
        snapshotUrl: null,
      },
    ],
    adoptions: [
      {
        id: 5,
        destinationCourseId: null,
        destinationCourseName: null,
        destinationCourseHost: null,
        adoptedVersionAt: null,
        adoptedAt: null,
        snapshotUrl: null,
      },
    ],
  });

  const page = renderPage();

  expect(await page.findByText('Marketplace Listing')).toBeInTheDocument();
  expect(page.getAllByText('—').length).toBeGreaterThan(1);
});

it('toasts and renders nothing when the fetch fails', async () => {
  mock.onGet(SHOW_URL).reply(500);

  const page = renderPage();

  expect(
    await page.findByText('Failed to load this marketplace listing.'),
  ).toBeInTheDocument();
});

it('loads a new listing after the previous listing failed', async () => {
  mock.onGet(SHOW_URL).reply(500);
  mock.onGet(SECOND_SHOW_URL).reply(
    200,
    detail({
      id: 2,
      title: SECOND_LISTING_TITLE,
    }),
  );

  const page = renderPage();
  await page.findByText('Failed to load this marketplace listing.');

  mockListingId = '2';
  // rerender bypasses test-utils' TestApp wrapper, so re-wrap to keep providers.
  page.rerender(
    <TestApp at={[SHOW_URL]}>
      <MarketplaceListingShow />
    </TestApp>,
  );

  expect(await page.findByText(SECOND_LISTING_TITLE)).toBeInTheDocument();
  expect(
    page.queryByText('Failed to load this marketplace listing.'),
  ).not.toBeInTheDocument();
});

it('does not keep the previous listing visible while a new listing loads', async () => {
  let resolveSecondRequest: (response: [number, unknown]) => void;
  mock.onGet(SHOW_URL).reply(200, detail());
  mock.onGet(SECOND_SHOW_URL).reply(
    () =>
      new Promise((resolve) => {
        resolveSecondRequest = resolve;
      }),
  );

  const page = renderPage();
  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();

  mockListingId = '2';
  // rerender bypasses test-utils' TestApp wrapper, so re-wrap to keep providers.
  page.rerender(
    <TestApp at={[SHOW_URL]}>
      <MarketplaceListingShow />
    </TestApp>,
  );

  expect(page.queryByText(LISTING_TITLE)).not.toBeInTheDocument();
  await waitFor(() => expect(resolveSecondRequest).toBeDefined());

  await act(async () => {
    resolveSecondRequest!([
      200,
      detail({
        id: 2,
        title: SECOND_LISTING_TITLE,
      }),
    ]);
  });

  expect(await page.findByText(SECOND_LISTING_TITLE)).toBeInTheDocument();
});

it('keeps the new listing when a superseded request fails late', async () => {
  let resolveFirstRequest: (response: [number]) => void;
  mock.onGet(SHOW_URL).reply(
    () =>
      new Promise((resolve) => {
        resolveFirstRequest = resolve;
      }),
  );
  mock.onGet(SECOND_SHOW_URL).reply(
    200,
    detail({
      id: 2,
      title: SECOND_LISTING_TITLE,
    }),
  );

  const page = renderPage();
  await waitFor(() => expect(resolveFirstRequest).toBeDefined());

  mockListingId = '2';
  // rerender bypasses test-utils' TestApp wrapper, so re-wrap to keep providers.
  page.rerender(
    <TestApp at={[SHOW_URL]}>
      <MarketplaceListingShow />
    </TestApp>,
  );

  expect(await page.findByText(SECOND_LISTING_TITLE)).toBeInTheDocument();

  await act(async () => {
    resolveFirstRequest!([500]);
  });

  expect(page.getByText(SECOND_LISTING_TITLE)).toBeInTheDocument();
  expect(
    page.queryByText('Failed to load this marketplace listing.'),
  ).not.toBeInTheDocument();
});

// The history is where two cuts sit side by side, so the time is what tells a same-day pair apart —
// and no ordinal survives anywhere on the page.
it('names versions by datetime and carries no ordinal', async () => {
  mock.onGet(SHOW_URL).reply(200, detail());

  const page = renderPage();

  expect(await page.findByText(LISTING_TITLE)).toBeInTheDocument();

  const history = page.getByRole('table', { name: VERSION_HISTORY });
  expect(within(history).queryByText(/^v\d+$/)).not.toBeInTheDocument();

  const adoptions = page.getByRole('table', { name: 'Adoptions' });
  expect(within(adoptions).queryByText(/^v\d+$/)).not.toBeInTheDocument();
});
