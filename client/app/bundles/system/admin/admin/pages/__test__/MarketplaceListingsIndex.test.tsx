import userEvent from '@testing-library/user-event';
import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor, within } from 'test-utils';

import GlobalAPI from 'api';
import SystemAPI from 'api/system';
import toast from 'lib/hooks/toast';

import MarketplaceListingsIndex from '../MarketplaceListingsIndex';

// The restore completion toast is a ReactNode (it carries a link), so capture it and render it
// rather than mounting a ToastContainer.
jest.mock('lib/hooks/toast', () => ({ success: jest.fn(), error: jest.fn() }));

const INDEX_URL = '/admin/marketplace_listings';
const SEARCH_PLACEHOLDER =
  'Search listings by assessment title or source course';
const RECURSION_DRILL = 'Recursion Drill';
const ARRAYS_WARMUP = 'Arrays Warmup';
const RETIRED_QUIZ = 'Retired Quiz';
const RESTORE_ACTION = 'Rebuild source assessment';
const OPEN_ACTION = 'Open source assessment';
const MAIN_CAMPUS = 'Main Campus';
const SATELLITE_CAMPUS = 'Satellite Campus';
const ASSESSMENT_DELETED_HINT =
  'The assessment this listing was originally published from has been deleted. The listing is unaffected: it goes on serving its last published version, and a source assessment is saved in the marketplace’s preview course so new versions can still be published.';
const COURSE_DELETED_HINT =
  'The course this listing was published from has been deleted. Its name is kept as a record of where the content came from.';
const DELETED_SUFFIX = '(deleted)';
const SOURCE_COURSE_NAME = 'Intro to Programming';
const MARKETPLACE_HOSTED = 'Marketplace-hosted';
const MARKETPLACE_HOSTED_HINT =
  "This listing's source assessment lives in the marketplace's own preview course, not in the course it was originally published from - the original was deleted, so the marketplace saved one to keep publishing from.";
const ID_COLUMN = 0;
const TITLE_COLUMN = 1;
const SOURCE_COLUMN = 2;
const INSTANCE_COLUMN = 3;
const VERSION_COLUMN = 4;
const ADOPTIONS_COLUMN = 5;
const STATE_COLUMN = 6;
const AUTHORING_URL = 'http://main.coursemology.org/courses/9/assessments/12';
const DELETE_BLOCKED_TOOLTIP =
  'A published listing cannot be deleted. Unlist it first, so the reversible step comes before the irreversible one.';
// pollJob keeps its interval running after the component unmounts (see its own docstring), so a
// poller started by one test outlives that test. Every test therefore gets its OWN job url: a stray
// poller then finds no handler registered for it and cannot satisfy — or break — the next test's
// assertions by resolving against that test's job handler.
const UNWATCHED_JOB_URL = '/jobs/unwatched';
const COMPLETED_JOB_URL = '/jobs/completed';
const ERRORED_JOB_URL = '/jobs/errored';
const RESTORED_URL = '/courses/77/assessments/321';

const mock = createMockAdapter(SystemAPI.admin.client);
// pollJob polls the *jobs* endpoint, which lives on a different axios client to the admin API.
const jobsMock = createMockAdapter(GlobalAPI.jobs.client);

beforeEach(() => {
  mock.reset();
  jobsMock.reset();
  jest.clearAllMocks();
});

const listingAt = (overrides = {}): unknown => ({
  id: 1,
  title: RECURSION_DRILL,
  currentVersionPublishedAt: '2026-07-24T07:04:00.000Z',
  lastPublishedAt: '2026-07-20T10:00:00.000Z',
  adoptions: 4,
  sourceCourseId: 9,
  sourceCourseName: SOURCE_COURSE_NAME,
  sourceInstanceName: MAIN_CAMPUS,
  sourceInstanceHost: 'main.coursemology.org',
  sourceStartedAt: '2026-01-15T10:00:00.000Z',
  sourceEndedAt: '2026-05-20T10:00:00.000Z',
  state: 'published',
  marketplaceHosted: false,
  sourceAssessmentDeleted: false,
  sourceCourseDeleted: false,
  authoringAssessmentUrl: AUTHORING_URL,
  ...overrides,
});

/**
 * How many times the listings index itself has been fetched. Counted by url rather than off
 * `mock.history.get.length`, which also holds the adapter's `/csrf_token` handshakes.
 */
const indexFetchCount = (): number =>
  mock.history.get.filter((request) => request.url === INDEX_URL).length;

/** Text of one column across every body row, in the order the rows are rendered. */
const columnTexts = (
  page: ReturnType<typeof render>,
  columnIndex: number,
): (string | null)[] =>
  page
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[columnIndex].textContent);

/**
 * Open one column's filter menu, click one of its items, then close the menu again — an open MUI menu
 * marks the rest of the page `aria-hidden`, so the table rows are unqueryable until it is. Scoped to
 * the column's own header cell: the table now carries two filter menus, both tooltipped "Filter".
 */
const clickFilterItem = async (
  page: ReturnType<typeof render>,
  columnIndex: number,
  itemName: string,
): Promise<void> => {
  const header = page.getAllByRole('columnheader')[columnIndex];
  fireEvent.click(within(header).getByRole('button', { name: 'Filter' }));
  fireEvent.click(await page.findByRole('menuitem', { name: itemName }));
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(page.queryByRole('menu')).not.toBeInTheDocument());
};

const clickStateFilterItem = (
  page: ReturnType<typeof render>,
  itemName: string,
): Promise<void> => clickFilterItem(page, STATE_COLUMN, itemName);

const clickInstanceFilterItem = (
  page: ReturnType<typeof render>,
  itemName: string,
): Promise<void> => clickFilterItem(page, INSTANCE_COLUMN, itemName);

it('renders a listing row with its version, adoptions and provenance', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt()] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();
  expect(page.getByText('24 Jul 2026')).toBeInTheDocument();
  expect(page.getByText('4')).toBeInTheDocument();
  expect(page.getByText(SOURCE_COURSE_NAME)).toBeInTheDocument();
});

// The served vintage is the only entrance to the version history, which is in turn the only index
// into the container course. One version per row means nothing to disambiguate against, so the time
// would be pure noise in an already-crowded table — it stays reachable on hover instead.
it('links the served vintage to the listing version history', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt()] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  // Queried by its visible text rather than by accessible name: the cell's Tooltip puts the full
  // timestamp on the anchor, and dom-accessibility-api prefers that over the name-from-content, so a
  // `name` query here would assert the tooltip's wording (and its timezone) instead of the link.
  const link = (await page.findByText('24 Jul 2026')).closest('a');
  expect(link).toHaveAttribute('href', '/admin/marketplace_listings/1');
});

it('carries no version ordinal anywhere in the row', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt()] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();
  expect(columnTexts(page, VERSION_COLUMN)).toEqual(['24 Jul 2026']);
});

it('renders the empty marker instead of a link when there is no version', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt({ currentVersionPublishedAt: null })],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();
  expect(columnTexts(page, VERSION_COLUMN)).toEqual(['—']);
  expect(
    page.queryByRole('link', { name: '24 Jul 2026' }),
  ).not.toBeInTheDocument();
});

// The link only navigates; the publishing itself happens on the assessment page, so the label says
// what the action does rather than what the destination page offers.
it('links Open source assessment to the authoring assessment', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt()] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  // The server hands back an ABSOLUTE url carrying the source course's own instance host, because a
  // course id resolves nowhere else — so this must be followed as a plain href, not a client route.
  const link = await page.findByRole('link', { name: OPEN_ACTION });
  expect(link).toHaveAttribute(
    'href',
    'http://main.coursemology.org/courses/9/assessments/12',
  );
});

// The title names the assessment, so it is the shortest route to it. Same absolute cross-instance url
// as the Actions link, for the same reason: a course id resolves only on its origin instance's host.
it('links the assessment title to its source assessment', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt()] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(
    await page.findByRole('link', { name: RECURSION_DRILL }),
  ).toHaveAttribute('href', AUTHORING_URL);
});

// The column describes the ORIGIN, so a deleted original leaves it struck through and unlinked. The
// suffix is what carries the fact to anyone who cannot see the strikethrough.
it('strikes out and unlinks a deleted source assessment', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toHaveClass('line-through');
  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    `${RECURSION_DRILL} ${DELETED_SUFFIX}`,
  ]);
  expect(
    page.queryByRole('link', { name: RECURSION_DRILL }),
  ).not.toBeInTheDocument();
});

// The case that makes the rule worth stating: a REBUILT listing still has an authoring copy, and the
// cell must not quietly fall through to it. That copy is a different assessment in the marketplace
// container, so linking a column headed "Source assessment" at it would claim the origin survived.
it('leaves a rebuilt listing’s source assessment unlinked, though a copy exists', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        marketplaceHosted: true,
        authoringAssessmentUrl:
          'http://preview.coursemology.org/courses/7/assessments/53',
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toHaveClass('line-through');
  expect(
    page.queryByRole('link', { name: RECURSION_DRILL }),
  ).not.toBeInTheDocument();
  // The copy keeps its own entrance, so nothing became unreachable.
  expect(page.getByRole('link', { name: OPEN_ACTION })).toHaveAttribute(
    'href',
    'http://preview.coursemology.org/courses/7/assessments/53',
  );
});

// A deleted course takes its assessment with it, so both columns mark — each with its own reason.
it('strikes out and unlinks a deleted source course', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        sourceCourseDeleted: true,
        authoringAssessmentUrl: null,
        sourceCourseId: null,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();
  expect(columnTexts(page, SOURCE_COLUMN)).toEqual([
    `Intro to Programming ${DELETED_SUFFIX}`,
  ]);
  expect(
    page.queryByRole('link', { name: SOURCE_COURSE_NAME }),
  ).not.toBeInTheDocument();
});

// "Deleted" beside a live, serving listing reads as "broken" on its own, so each mark carries the
// sentence that says otherwise — and the two reasons are different, so they are two sentences.
it('explains on each mark what the deletion did and did not affect', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        sourceCourseDeleted: true,
        authoringAssessmentUrl: null,
        sourceCourseId: null,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByLabelText(ASSESSMENT_DELETED_HINT)).toHaveTextContent(
    RECURSION_DRILL,
  );
  expect(page.getByLabelText(COURSE_DELETED_HINT)).toHaveTextContent(
    SOURCE_COURSE_NAME,
  );
});

// Deleting the origin no longer changes whether the listing is on the marketplace: the authoring copy
// is rebuilt automatically, so the listing goes on serving and goes on saying so.
it('keeps a listing published when its origin was deleted', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        marketplaceHosted: true,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText('Published')).toBeInTheDocument();
  expect(page.queryByText('Orphaned')).not.toBeInTheDocument();
});

// "4 adoptions" raises "which courses?", and the listing page is the only place that answers it.
it('links a non-zero adoption count to the listing page', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({ id: 42, adoptions: 4 }),
      listingAt({ id: 43, title: ARRAYS_WARMUP, adoptions: 0 }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByRole('link', { name: '4' })).toHaveAttribute(
    'href',
    '/admin/marketplace_listings/42',
  );

  // Zero stays plain text — there is no adoption list to go and look at, and the id beside it is
  // already the unconditional entrance to the same page.
  expect(columnTexts(page, ADOPTIONS_COLUMN)).toEqual(['4', '0']);
  expect(page.queryByRole('link', { name: '0' })).not.toBeInTheDocument();
});

// `Course` is tenanted by instance, so a course id resolves ONLY on its own instance's host — a
// relative link 404s for every listing published from another instance.
it('links the source course on its own instance host', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt({ sourceInstanceHost: 'satellite.coursemology.org' })],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  const link = await page.findByRole('link', { name: SOURCE_COURSE_NAME });
  expect(link).toHaveAttribute(
    'href',
    '//satellite.coursemology.org/courses/9/assessments',
  );
});

// The exact column set, in order: the source course's teaching period was dropped from this table —
// an admin auditing listings never asked "which term?", and the column cost width the actions needed.
it('names the instance in its own column beside the source course', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt()] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  // Just "Instance" — adjacency to "Source course" carries whose instance it is.
  expect(
    page.getAllByRole('columnheader').map((header) => header.textContent),
  ).toEqual([
    'ID',
    'Original assessment',
    'Source course',
    'Instance',
    'Version',
    'Adoptions',
    'State',
    'Actions',
  ]);

  expect(columnTexts(page, INSTANCE_COLUMN)).toEqual([MAIN_CAMPUS]);
});

// The instance is only reachable on its own host, so the cell goes there rather than to a route on
// the admin's host that would resolve to the wrong deployment.
it('links the instance to its own host', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceInstanceName: SATELLITE_CAMPUS,
        sourceInstanceHost: 'satellite.coursemology.org',
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(
    await page.findByRole('link', { name: SATELLITE_CAMPUS }),
  ).toHaveAttribute('href', '//satellite.coursemology.org/');
});

// Listings that were already orphaned when the column was introduced have no source course for the
// backfill to read the instance off, and there is no recovery path — so the row says so rather than
// silently omitting the origin.
it('renders the empty marker for a listing with no recorded instance', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        sourceCourseDeleted: true,
        authoringAssessmentUrl: null,
        sourceCourseId: null,
        sourceCourseName: 'Retired Course',
        sourceInstanceName: null,
        sourceInstanceHost: null,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();
  // The denormalised course name survives the course deletion; the instance was never recorded, so
  // the Instance column says so instead of leaving the origin blank. Neither is a link — there is
  // nothing left to navigate to.
  expect(columnTexts(page, SOURCE_COLUMN)).toEqual([
    `Retired Course ${DELETED_SUFFIX}`,
  ]);
  expect(columnTexts(page, INSTANCE_COLUMN)).toEqual(['—']);
  expect(
    page.queryByRole('link', { name: 'Retired Course' }),
  ).not.toBeInTheDocument();
});

// Not a disabled placeholder either: nothing in the Actions cell mentions opening a copy that does
// not exist, so the cell holds only actions that can actually be taken.
it('hides the open action entirely while a listing has no authoring copy', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 0,
      }),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        sourceAssessmentDeleted: true,
        sourceCourseDeleted: true,
        authoringAssessmentUrl: null,
        sourceCourseId: null,
        adoptions: 0,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  const [assessmentDeleted, courseDeleted] = page.getAllByRole('row').slice(1);

  [assessmentDeleted, courseDeleted].forEach((row) => {
    expect(within(row).queryByText(OPEN_ACTION)).not.toBeInTheDocument();
    // The restore and delete actions are what remains — the cell is not simply empty.
    expect(
      within(row).getByRole('button', { name: RESTORE_ACTION }),
    ).toBeInTheDocument();
  });
});

it('narrows the listings to those matching the searched assessment title', async () => {
  const user = userEvent.setup();
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt(), listingAt({ id: 2, title: ARRAYS_WARMUP })],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  await user.type(page.getByPlaceholderText(SEARCH_PLACEHOLDER), 'Arrays');

  await waitFor(() =>
    expect(page.queryByText(RECURSION_DRILL)).not.toBeInTheDocument(),
  );
  expect(page.getByText(ARRAYS_WARMUP)).toBeInTheDocument();
});

// Search deliberately spans TWO columns and no more: title and source course. Source course is
// searchable instead of filterable because courses number in the hundreds — "listings from CS1010" is
// a text query, not a set selection. This test previously pinned search as title-ONLY; it now pins
// the widened scope, and still fails if a stray `searchable: true` reaches a third column.
it('searches assessment titles and source courses, not the other columns', async () => {
  const user = userEvent.setup();
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        sourceCourseName: 'Data Structures',
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  const search = page.getByPlaceholderText(SEARCH_PLACEHOLDER);
  const bothRows = [RECURSION_DRILL, ARRAYS_WARMUP];

  // The source course of the second row only.
  await user.type(search, 'Data Struct');

  await waitFor(() =>
    expect(columnTexts(page, TITLE_COLUMN)).toEqual([ARRAYS_WARMUP]),
  );

  await user.clear(search);
  await waitFor(() =>
    expect(columnTexts(page, TITLE_COLUMN)).toEqual(bothRows),
  );

  // The instance, which both rows carry: a two-value, low-cardinality dimension belongs behind the
  // Instance column's FILTER, so putting it in the free-text box would invite typing "Main Campus"
  // instead of filtering. Search must not match it even though the column is right beside the one it
  // does match.
  await user.type(search, MAIN_CAMPUS);

  await waitFor(() => expect(columnTexts(page, TITLE_COLUMN)).toEqual([]));

  await user.clear(search);
  await waitFor(() =>
    expect(columnTexts(page, TITLE_COLUMN)).toEqual(bothRows),
  );

  // The served vintage, which both rows also carry: an unsearchable column must match neither.
  await user.type(search, '24 Jul');

  await waitFor(() => expect(columnTexts(page, TITLE_COLUMN)).toEqual([]));
});

it('sorts the listings by assessment title in both directions', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt(), listingAt({ id: 2, title: ARRAYS_WARMUP })],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();
  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    RECURSION_DRILL,
    ARRAYS_WARMUP,
  ]);

  fireEvent.click(page.getByRole('button', { name: 'Original assessment' }));

  await waitFor(() =>
    expect(columnTexts(page, TITLE_COLUMN)).toEqual([
      ARRAYS_WARMUP,
      RECURSION_DRILL,
    ]),
  );

  fireEvent.click(page.getByRole('button', { name: 'Original assessment' }));

  await waitFor(() =>
    expect(columnTexts(page, TITLE_COLUMN)).toEqual([
      RECURSION_DRILL,
      ARRAYS_WARMUP,
    ]),
  );
});

// Sorting groups the table by origin, which is the other half of what a per-course filter would have
// given — without a menu that grows with the table.
it('sorts the listings by source course in both directions', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({ sourceCourseName: SOURCE_COURSE_NAME }),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        sourceCourseName: 'Data Structures',
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  fireEvent.click(page.getByRole('button', { name: 'Source course' }));

  await waitFor(() =>
    expect(columnTexts(page, TITLE_COLUMN)).toEqual([
      ARRAYS_WARMUP,
      RECURSION_DRILL,
    ]),
  );

  fireEvent.click(page.getByRole('button', { name: 'Source course' }));

  await waitFor(() =>
    expect(columnTexts(page, TITLE_COLUMN)).toEqual([
      RECURSION_DRILL,
      ARRAYS_WARMUP,
    ]),
  );
});

// Sorting by instance comes free with the column, and groups the table by deployment.
it('sorts the listings by instance in both directions', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        sourceInstanceName: SATELLITE_CAMPUS,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  fireEvent.click(page.getByRole('button', { name: 'Instance' }));

  await waitFor(() =>
    expect(columnTexts(page, INSTANCE_COLUMN)).toEqual([
      MAIN_CAMPUS,
      SATELLITE_CAMPUS,
    ]),
  );

  fireEvent.click(page.getByRole('button', { name: 'Instance' }));

  await waitFor(() =>
    expect(columnTexts(page, INSTANCE_COLUMN)).toEqual([
      SATELLITE_CAMPUS,
      MAIN_CAMPUS,
    ]),
  );
});

// A handful of instances, stable values, and the natural slice for an admin auditing one deployment's
// contributions. The "not recorded" bucket is real, not an omission: it is where listings that were
// already orphaned before the column existed live.
it('filters the listings by the source instance, including the unrecorded bucket', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        sourceInstanceName: SATELLITE_CAMPUS,
        sourceInstanceHost: 'satellite.coursemology.org',
      }),
      listingAt({
        id: 3,
        title: RETIRED_QUIZ,
        sourceAssessmentDeleted: true,
        sourceCourseDeleted: true,
        authoringAssessmentUrl: null,
        sourceCourseId: null,
        sourceInstanceName: null,
        sourceInstanceHost: null,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  await clickInstanceFilterItem(page, SATELLITE_CAMPUS);

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([ARRAYS_WARMUP]);

  await clickInstanceFilterItem(page, 'Instance not recorded');

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    ARRAYS_WARMUP,
    `${RETIRED_QUIZ} ${DELETED_SUFFIX}`,
  ]);

  await clickInstanceFilterItem(page, 'Clear filter');

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    RECURSION_DRILL,
    ARRAYS_WARMUP,
    `${RETIRED_QUIZ} ${DELETED_SUFFIX}`,
  ]);
});

// Two independent menus in two different header cells: filtering by instance must not disturb the
// state filter, and neither may hijack the other's selection.
it('keeps the state and source instance filters independent', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        state: 'unlisted',
        sourceInstanceName: SATELLITE_CAMPUS,
      }),
      listingAt({ id: 3, title: RETIRED_QUIZ, state: 'unlisted' }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  await clickStateFilterItem(page, 'Unlisted');

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    ARRAYS_WARMUP,
    RETIRED_QUIZ,
  ]);

  await clickInstanceFilterItem(page, MAIN_CAMPUS);

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([RETIRED_QUIZ]);
});

it('sorts adoptions numerically rather than lexicographically', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({ id: 1, title: 'Nine Adopters', adoptions: 9 }),
      listingAt({ id: 2, title: 'Twelve Adopters', adoptions: 12 }),
      listingAt({ id: 3, title: 'Four Adopters', adoptions: 4 }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText('Nine Adopters')).toBeInTheDocument();

  fireEvent.click(page.getByRole('button', { name: 'Adoptions' }));

  await waitFor(() =>
    expect(columnTexts(page, ADOPTIONS_COLUMN)).toEqual(['12', '9', '4']),
  );

  fireEvent.click(page.getByRole('button', { name: 'Adoptions' }));

  await waitFor(() =>
    expect(columnTexts(page, ADOPTIONS_COLUMN)).toEqual(['4', '9', '12']),
  );
});

it('filters the listings by the states selected in the State column, and restores them all when the filter is cleared', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({ id: 2, title: ARRAYS_WARMUP, state: 'unlisted' }),
      listingAt({
        id: 3,
        title: 'Legacy Quiz',
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  await clickStateFilterItem(page, 'Unlisted');

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([ARRAYS_WARMUP]);

  await clickStateFilterItem(page, 'Published');

  // Both states selected is every row — including the one whose origin was deleted, which is
  // published like any other.
  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    RECURSION_DRILL,
    ARRAYS_WARMUP,
    `Legacy Quiz ${DELETED_SUFFIX}`,
  ]);

  await clickStateFilterItem(page, 'Clear filter');

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    RECURSION_DRILL,
    ARRAYS_WARMUP,
    `Legacy Quiz ${DELETED_SUFFIX}`,
  ]);
});

// The State column answers marketplace visibility and nothing else, so a deleted origin leaves no
// mark on it at all — the two Source columns carry that, and only they do.
it('tells the two deletion cases apart in the Source columns, not the State column', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
      }),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        sourceAssessmentDeleted: true,
        sourceCourseDeleted: true,
        authoringAssessmentUrl: null,
        sourceCourseId: null,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  const [assessmentDeleted, courseDeleted] = page.getAllByRole('row').slice(1);

  // Both mark their assessment; only the second also lost its course.
  expect(
    within(assessmentDeleted).getByLabelText(ASSESSMENT_DELETED_HINT),
  ).toBeInTheDocument();
  expect(
    within(assessmentDeleted).queryByLabelText(COURSE_DELETED_HINT),
  ).not.toBeInTheDocument();
  expect(
    within(courseDeleted).getByLabelText(COURSE_DELETED_HINT),
  ).toBeInTheDocument();

  expect(columnTexts(page, STATE_COLUMN)).toEqual(['Published', 'Published']);
});

// The State column used to carry the whole "Orphaned — assessment deleted" phrase in one chip, which
// made it greedy enough to squeeze Actions to ~90px and wrap every label onto three lines. Actions now
// sit on ONE row and each label is unbreakable, so a row's height never depends on its action count.
it('keeps every action label on one line in a single row', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 0,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  const openLink = await page.findByRole('link', { name: OPEN_ACTION });
  expect(openLink).toHaveClass('whitespace-nowrap');

  const restoreButton = page.getByRole('button', { name: RESTORE_ACTION });
  expect(restoreButton).toHaveClass('whitespace-nowrap');

  [openLink, restoreButton].forEach((action) => {
    const row = action.closest('div');
    expect(row).toHaveClass('flex');
    expect(row).not.toHaveClass('flex-wrap');
  });

  // Fixed slot order — list/unlist, then restore, then delete — so no action moves between rows.
  // Scoped to this row: every row carries the visibility and delete actions now, published included.
  const row = restoreButton.closest('tr')!;
  const actions = Array.from(restoreButton.parentElement!.children);
  expect(actions[0]).toHaveTextContent('Unlist');
  expect(actions[1]).toBe(restoreButton);
  expect(actions[2]).toContainElement(
    within(row).getByTestId('DeleteIconButton'),
  );
});

// The reversible half of the maintenance pair. It is admin-side and keyed on the listing id, because
// the course-side unlist resolves the listing through its authoring assessment — which a listing
// whose source was deleted no longer has, so that path cannot reach exactly the rows that need it.
it('unlists a published listing and refetches', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt()] });
  mock.onPatch(`${INDEX_URL}/1`).reply(200);

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByRole('button', { name: 'Unlist' }));

  const dialog = await page.findByRole('dialog');
  expect(
    within(dialog).getByText(/stops appearing in the marketplace/),
  ).toBeVisible();
  // Unlisting is what has to happen before a deletion, so the dialog says so.
  expect(within(dialog).getByText(/reversible/)).toBeVisible();

  fireEvent.click(within(dialog).getByRole('button', { name: 'Unlist' }));

  await waitFor(() => expect(mock.history.patch).toHaveLength(1));
  expect(JSON.parse(mock.history.patch[0].data)).toEqual({ published: false });
  // The row's state changes server-side, and with it whether the row can be deleted at all.
  await waitFor(() => expect(indexFetchCount()).toBe(2));
});

it('lists an unlisted listing again', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt({ state: 'unlisted' })],
  });
  mock.onPatch(`${INDEX_URL}/1`).reply(200);

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByRole('button', { name: 'List' }));

  const dialog = await page.findByRole('dialog');
  // Re-listing serves the version already held — it must never read as publishing a new one.
  expect(
    within(dialog).getByText(/serving the version it already holds/),
  ).toBeVisible();

  fireEvent.click(within(dialog).getByRole('button', { name: 'List' }));

  await waitFor(() => expect(mock.history.patch).toHaveLength(1));
  expect(JSON.parse(mock.history.patch[0].data)).toEqual({ published: true });
});

// One button, flipping with the state it reads: offering both at once would leave one permanently
// inert, and a listing is either on the marketplace or it is not.
it('offers only the opposite action on each row', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({ id: 2, title: ARRAYS_WARMUP, state: 'unlisted' }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  const [published, unlisted] = page.getAllByRole('row').slice(1);

  expect(
    within(published).getByRole('button', { name: 'Unlist' }),
  ).toBeInTheDocument();
  expect(
    within(published).queryByRole('button', { name: 'List' }),
  ).not.toBeInTheDocument();
  expect(
    within(unlisted).getByRole('button', { name: 'List' }),
  ).toBeInTheDocument();
});

it('surfaces the server’s reason when it refuses to list', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({ state: 'unlisted', currentVersionPublishedAt: null }),
    ],
  });
  mock.onPatch(`${INDEX_URL}/1`).reply(422, {
    errors: ['This listing has no published version to serve.'],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByRole('button', { name: 'List' }));
  fireEvent.click(
    within(await page.findByRole('dialog')).getByRole('button', {
      name: 'List',
    }),
  );

  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      'This listing has no published version to serve.',
    ),
  );
});

// Deletion follows `Listing#purgeable?`: enabled wherever the listing is OFF the marketplace —
// orphaned or unlisted — and never on a published one, which must be unlisted first so the
// reversible step precedes the irreversible one. The button is on every row either way: a missing
// icon reads as "this table cannot delete" and leaves nowhere to learn the rule. Adoption count
// gates nothing at all — a deliberate deletion of an adopted listing must be allowed to proceed —
// so every purgeable row's delete action is enabled regardless of how many courses adopted it.
it('offers permanent deletion off the marketplace only, regardless of adoption history', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 4,
      }),
      listingAt({
        id: 3,
        title: RETIRED_QUIZ,
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 0,
      }),
      // Unlisted keeps its source assessment, so unlike the orphans it still carries an open action.
      listingAt({
        id: 4,
        title: 'Unlisted Quiz',
        state: 'unlisted',
        adoptions: 0,
      }),
      listingAt({
        id: 5,
        title: 'Unlisted And Adopted',
        state: 'unlisted',
        adoptions: 2,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  const [published, adopted, unadopted, unlisted, unlistedAdopted] = page
    .getAllByRole('row')
    .slice(1);

  // A published listing is unlisted, never deleted — so the icon is present but inert, and says why
  // on hover rather than leaving the admin to guess at a control that simply is not there.
  expect(within(published).getByTestId('DeleteIconButton')).toBeDisabled();
  expect(
    within(published).getByLabelText(DELETE_BLOCKED_TOOLTIP),
  ).toBeInTheDocument();

  [adopted, unadopted, unlisted, unlistedAdopted].forEach((row) => {
    expect(within(row).getByTestId('DeleteIconButton')).toBeEnabled();
    expect(
      within(row).getByLabelText('Delete permanently'),
    ).toBeInTheDocument();
  });
});

// A disabled MUI IconButton swallows pointer events, so the tooltip only fires because DeleteButton
// wraps it in a `span` — and the whole point of keeping the icon is that hovering it explains the
// rule. Clicking must still do nothing: no confirm dialog, no request.
it('opens no confirm dialog from the disabled delete on a published listing', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt()] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByTestId('DeleteIconButton'));

  expect(page.queryByRole('dialog')).not.toBeInTheDocument();
  expect(mock.history.delete).toHaveLength(0);
});

// Adoption count is decision-relevant even though it no longer disables anything: a deliberate
// deletion needs the facts at the moment of deciding, so the confirm dialog states how many courses
// adopted the listing and that their copies are unaffected — layered on top of whichever of the
// orphaned/unlisted messages applies, not replacing it.
it('warns in the confirm dialog how many courses adopted the listing, layered on the base message', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 3,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByTestId('DeleteIconButton'));

  const dialog = await page.findByRole('dialog');
  // The base orphaned message is still present …
  expect(
    within(dialog).getByText(/all of its versions and the snapshots/),
  ).toBeVisible();
  // … with the adoption warning layered on top, not swapped in for it.
  expect(
    within(dialog).getByText(
      /3 courses have adopted this listing\. Their existing copies will not be affected, but the adoption history will be destroyed\./,
    ),
  ).toBeVisible();
});

it('does not show an adoption warning in the confirm dialog when nothing adopted the listing', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt({ state: 'unlisted', adoptions: 0 })],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByTestId('DeleteIconButton'));

  const dialog = await page.findByRole('dialog');
  expect(
    within(dialog).queryByText(/adopted this listing/),
  ).not.toBeInTheDocument();
});

// The two cases destroy different things, so they cannot share one warning: an orphan has already
// lost its source, whereas an unlisted listing keeps it — and telling someone to unlist a listing
// that is already unlisted is no advice at all.
it('warns that an unlisted deletion spares the source assessment', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt({ state: 'unlisted', adoptions: 0 })],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByTestId('DeleteIconButton'));

  const dialog = await page.findByRole('dialog');
  expect(
    within(dialog).getByText(/all of its versions and the snapshots/),
  ).toBeVisible();
  expect(
    within(dialog).getByText(
      /source assessment is not affected and can be published again/,
    ),
  ).toBeVisible();
  expect(
    within(dialog).queryByText(/unlist it instead/),
  ).not.toBeInTheDocument();
});

it('warns what a permanent deletion destroys, then deletes and refetches', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 0,
      }),
    ],
  });
  mock.onDelete(`${INDEX_URL}/1`).reply(200);

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByTestId('DeleteIconButton'));

  const dialog = await page.findByRole('dialog');
  expect(
    within(dialog).getByText(/all of its versions and the snapshots/),
  ).toBeVisible();
  expect(within(dialog).getByText(/cannot be undone/)).toBeVisible();

  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

  await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  expect(mock.history.delete[0].url).toBe(`${INDEX_URL}/1`);
  // The row is gone only because the list refetched — the client never patches it locally.
  await waitFor(() => expect(indexFetchCount()).toBe(2));
});

it('surfaces the server’s reason when it refuses a permanent deletion', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 0,
      }),
    ],
  });
  mock.onDelete(`${INDEX_URL}/1`).reply(422, {
    errors: ['This listing has been adopted by other courses.'],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByTestId('DeleteIconButton'));
  fireEvent.click(
    within(await page.findByRole('dialog')).getByRole('button', {
      name: 'Delete',
    }),
  );

  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      'This listing has been adopted by other courses.',
    ),
  );
});

// There is no destination to choose: the copy always lands in the marketplace's own container, so
// the dialog is a plain confirm.
it('restores without asking for a destination course', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 0,
      }),
    ],
  });
  mock
    .onPost(`${INDEX_URL}/1/restore_authoring`)
    .reply(200, { status: 'submitted', jobUrl: UNWATCHED_JOB_URL });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByRole('button', { name: RESTORE_ACTION }));

  const dialog = await page.findByRole('dialog');
  expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument();

  fireEvent.click(within(dialog).getByRole('button', { name: 'Rebuild' }));

  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  // No destination is sent at all — the server owns the only correct destination.
  expect(mock.history.post[0].data).toBeUndefined();
});

it('tells the admin the copy lands in the marketplace container', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        sourceCourseDeleted: true,
        authoringAssessmentUrl: null,
        sourceCourseId: null,
        adoptions: 0,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByRole('button', { name: RESTORE_ACTION }));

  const dialog = await page.findByRole('dialog');
  expect(
    within(dialog).getByText(/marketplace's own container course/),
  ).toBeVisible();
  // The picker is gone for BOTH orphan states — a deleted origin course no longer changes anything.
  expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument();
});

it('toasts a link to the restored assessment and refetches once the job completes', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 0,
      }),
    ],
  });
  mock
    .onPost(`${INDEX_URL}/1/restore_authoring`)
    .reply(200, { status: 'submitted', jobUrl: COMPLETED_JOB_URL });
  jobsMock
    .onGet(COMPLETED_JOB_URL)
    .reply(200, { status: 'completed', redirectUrl: RESTORED_URL });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByRole('button', { name: RESTORE_ACTION }));
  fireEvent.click(
    within(await page.findByRole('dialog')).getByRole('button', {
      name: 'Rebuild',
    }),
  );

  // pollJob polls every 2s — longer than waitFor's 1s default.
  await waitFor(() => expect(toast.success).toHaveBeenCalled(), {
    timeout: 6000,
  });

  const message = (toast.success as unknown as jest.Mock).mock.calls[0][0];
  const toasted = render(<div>{message}</div>);

  expect(
    await toasted.findByText(
      /Source assessment rebuilt in the marketplace container\./,
    ),
  ).toBeInTheDocument();
  expect(
    toasted.getByRole('link', { name: 'View assessment' }),
  ).toHaveAttribute('href', RESTORED_URL);

  // The listing's state and authoring url both change server-side, so the list must refetch.
  await waitFor(() => expect(indexFetchCount()).toBe(2));
}, 10000);

it('reports a failed restore job without claiming success', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        adoptions: 0,
      }),
    ],
  });
  mock
    .onPost(`${INDEX_URL}/1/restore_authoring`)
    .reply(200, { status: 'submitted', jobUrl: ERRORED_JOB_URL });
  jobsMock.onGet(ERRORED_JOB_URL).reply(200, { status: 'errored' });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  fireEvent.click(await page.findByRole('button', { name: RESTORE_ACTION }));
  fireEvent.click(
    within(await page.findByRole('dialog')).getByRole('button', {
      name: 'Rebuild',
    }),
  );

  await waitFor(() => expect(toast.error).toHaveBeenCalled(), {
    timeout: 6000,
  });

  expect(toast.error).toHaveBeenCalledWith(
    'Could not rebuild the source assessment.',
  );
  expect(toast.success).not.toHaveBeenCalled();
}, 10000);

it('offers no restore for an orphan with no version to restore from', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt({
        sourceAssessmentDeleted: true,
        authoringAssessmentUrl: null,
        currentVersionPublishedAt: null,
        adoptions: 0,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  // Deletion is still on offer — it is the version, not the orphan state, that restore needs.
  expect(await page.findByTestId('DeleteIconButton')).toBeInTheDocument();
  expect(
    page.queryByRole('button', { name: RESTORE_ACTION }),
  ).not.toBeInTheDocument();
});

// A rebuilt listing keeps naming its ORIGIN course in the Source course column — that provenance is a
// historical fact the rebuild deliberately leaves alone — so without this marker its row is
// indistinguishable from a listing whose source assessment really is still in that course.
it('marks a marketplace-hosted listing apart from one with its own source course', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({
        id: 2,
        title: ARRAYS_WARMUP,
        marketplaceHosted: true,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  const [ownSource, hosted] = page.getAllByRole('row').slice(1);

  // Both are on the marketplace, so both keep the same state chip: the marker is what separates them.
  expect(within(ownSource).getByText('Published')).toBeInTheDocument();
  expect(within(hosted).getByText('Published')).toBeInTheDocument();

  expect(within(hosted).getByText(MARKETPLACE_HOSTED)).toBeInTheDocument();
  expect(
    within(ownSource).queryByText(MARKETPLACE_HOSTED),
  ).not.toBeInTheDocument();
});

it('explains on the marker what marketplace-hosted means', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt({ marketplaceHosted: true })],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByLabelText(MARKETPLACE_HOSTED_HINT)).toHaveTextContent(
    MARKETPLACE_HOSTED,
  );
});

// Visibility and authoring location are independent axes, and the marker is a facet rather than a
// state value precisely so this holds: a marketplace-hosted listing that is later unlisted still
// reports both facts, and each is separately filterable.
it('keeps the state chip when a marketplace-hosted listing is unlisted', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt({ state: 'unlisted', marketplaceHosted: true })],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText('Unlisted')).toBeInTheDocument();
  expect(page.getByText(MARKETPLACE_HOSTED)).toBeInTheDocument();
});

it('filters on the marketplace-hosted facet independently of the state values', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({ id: 2, title: ARRAYS_WARMUP, marketplaceHosted: true }),
      listingAt({
        id: 3,
        title: RETIRED_QUIZ,
        state: 'unlisted',
        marketplaceHosted: true,
      }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();

  // Cuts across published and unlisted alike — which is the point of asking for it as its own facet.
  await clickStateFilterItem(page, MARKETPLACE_HOSTED);

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    ARRAYS_WARMUP,
    RETIRED_QUIZ,
  ]);

  await clickStateFilterItem(page, MARKETPLACE_HOSTED);
  await clickStateFilterItem(page, 'Unlisted');

  // The state values still filter on state alone: the hosted published row is excluded here.
  expect(columnTexts(page, TITLE_COLUMN)).toEqual([RETIRED_QUIZ]);

  await clickStateFilterItem(page, 'Clear filter');

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    RECURSION_DRILL,
    ARRAYS_WARMUP,
    RETIRED_QUIZ,
  ]);
});

// The complement, which is the half an admin auditing who-owns-what actually needs: "which listings
// still depend on course staff". Labelled as a negation and NOT chipped on the rows — it is the
// ordinary state of the world, and a second noun beside Published/Unlisted would read as a state.
it('filters on the negation of the marketplace-hosted facet', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [
      listingAt(),
      listingAt({ id: 2, title: ARRAYS_WARMUP, marketplaceHosted: true }),
    ],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();
  // Only the exception is marked on the row; the ordinary case carries no chip of its own.
  expect(page.getAllByText(MARKETPLACE_HOSTED)).toHaveLength(1);

  await clickStateFilterItem(page, 'Not marketplace-hosted');

  expect(columnTexts(page, TITLE_COLUMN)).toEqual([RECURSION_DRILL]);

  await clickStateFilterItem(page, MARKETPLACE_HOSTED);

  // Both halves selected is every row — the pair is exhaustive.
  expect(columnTexts(page, TITLE_COLUMN)).toEqual([
    RECURSION_DRILL,
    ARRAYS_WARMUP,
  ]);
});

it('shows the empty state when there are no listings', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(
    await page.findByText('No assessments have been published yet.'),
  ).toBeInTheDocument();
});

// The id is a primary key, not a position: deleting a listing renumbers nothing. It is surfaced
// because it is the only thing that separates two listings sharing a title and a source course,
// and because the container's version chips name listings by it.
it('shows each listing id', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt({ id: 42 })] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByText(RECURSION_DRILL)).toBeInTheDocument();
  expect(columnTexts(page, ID_COLUMN)).toEqual(['42']);
});

it('links the id to the listing history page', async () => {
  mock.onGet(INDEX_URL).reply(200, { listings: [listingAt({ id: 42 })] });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByRole('link', { name: '42' })).toHaveAttribute(
    'href',
    '/admin/marketplace_listings/42',
  );
});

// The Version cell is only a link when a version exists, so before this column a listing that had
// never published one had NO route to its own history page from anywhere in the application.
it('links the id even when the listing has never published a version', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    listings: [listingAt({ id: 42, currentVersionPublishedAt: null })],
  });

  const page = render(<MarketplaceListingsIndex />, { at: [INDEX_URL] });

  expect(await page.findByRole('link', { name: '42' })).toHaveAttribute(
    'href',
    '/admin/marketplace_listings/42',
  );
  expect(columnTexts(page, VERSION_COLUMN)).toEqual(['—']);
});
