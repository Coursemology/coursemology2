import userEvent from '@testing-library/user-event';
import { render, waitFor, within } from 'test-utils';
import {
  AssessmentListData,
  AssessmentsListData,
} from 'types/course/assessment/assessments';

import AssessmentsTable from '../AssessmentsTable';

const SEARCH_PLACEHOLDER = 'Search by assessment title or source course';
const NO_RESULTS_MESSAGE = "Whoops, there's nothing to see here, yet!";

const assessment = (
  overrides: Partial<AssessmentListData> = {},
): AssessmentListData => ({
  id: 1,
  title: 'Recursion',
  status: 'open',
  actionButtonUrl: null,
  passwordProtected: false,
  published: true,
  autograded: false,
  hasPersonalTimes: false,
  affectsPersonalTimes: false,
  url: '/courses/1/assessments/1',
  conditionSatisfied: true,
  startAt: { isFixed: false, effectiveTime: null, referenceTime: null },
  isStartTimeBegin: true,
  ...overrides,
});

const listData = (
  assessments: AssessmentListData[],
  isMarketplaceContainer: boolean,
): AssessmentsListData => ({
  display: {
    isStudent: false,
    isGamified: false,
    isKoditsuExamEnabled: false,
    timelineAlgorithm: 'fixed',
    allowRandomization: false,
    isAchievementsEnabled: false,
    isMonitoringEnabled: false,
    bonusAttributes: false,
    endTimes: false,
    canCreateAssessments: true,
    canImportAssessments: true,
    tabId: 1,
    tabTitle: 'Assessments: Default',
    tabUrl: '/courses/1/assessments',
    canManageMonitor: false,
    isMarketplaceContainer,
    category: {
      id: 1,
      title: 'Assessments',
      tabs: [{ id: 1, title: 'Default' }],
    },
  },
  assessments,
});

/**
 * Four rows across three listings, covering every version kind: two cuts of a published listing
 * (one served, one superseded), the single served cut of another, and the newest cut of a listing
 * that has been taken off the marketplace.
 */
const containerRows = (): AssessmentListData[] => [
  assessment({
    id: 1,
    title: 'Publish me 2',
    marketplaceVersion: {
      listingId: 4,
      publishedAt: '2026-07-29T01:01:00Z',
      source: 'Marketplace Preview Fixtures',
      latest: false,
      listed: true,
    },
  }),
  assessment({
    id: 2,
    title: 'Publish me 2',
    marketplaceVersion: {
      listingId: 4,
      publishedAt: '2026-07-29T01:04:00Z',
      source: 'Marketplace Preview Fixtures',
      latest: true,
      listed: true,
    },
  }),
  assessment({
    id: 3,
    title: 'Listed MCQ',
    marketplaceVersion: {
      listingId: 2,
      publishedAt: '2026-07-29T00:59:00Z',
      source: 'Other Source Course',
      latest: true,
      listed: true,
    },
  }),
  assessment({
    id: 4,
    title: 'Taken down',
    marketplaceVersion: {
      listingId: 5,
      publishedAt: '2026-07-29T02:07:00Z',
      source: 'Retired Source Course',
      latest: true,
      listed: false,
    },
  }),
];

// Column headers are matched by REGEX, never by an exact string: a filterable column's header cell
// also contains the filter IconButton, whose tooltip contributes "Filter" to the cell's accessible
// name (MUI applies the tooltip title as `aria-label` on a child with no text of its own).
describe('<AssessmentsTable /> in the marketplace container', () => {
  it('adds the Listing, Version and Source columns', async () => {
    const page = render(
      <AssessmentsTable assessments={listData(containerRows(), true)} />,
    );

    expect(
      await page.findByRole('columnheader', { name: /Listing/ }),
    ).toBeInTheDocument();
    expect(
      page.getByRole('columnheader', { name: /Version/ }),
    ).toBeInTheDocument();
    expect(
      page.getByRole('columnheader', { name: /Source/ }),
    ).toBeInTheDocument();
  });

  // The container tab is the ONLY place these belong. Leaking them would rewrite the assessments
  // index for every course in the deployment.
  it('shows none of them, and no search box, in an ordinary course', async () => {
    const page = render(
      <AssessmentsTable
        assessments={listData([assessment({ title: 'Recursion' })], false)}
      />,
    );

    expect(
      await page.findByRole('link', { name: 'Recursion' }),
    ).toBeInTheDocument();
    expect(
      page.queryByRole('columnheader', { name: /Listing/ }),
    ).not.toBeInTheDocument();
    expect(
      page.queryByRole('columnheader', { name: /Version/ }),
    ).not.toBeInTheDocument();
    expect(
      page.queryByRole('columnheader', { name: /Source/ }),
    ).not.toBeInTheDocument();
    expect(
      page.queryByPlaceholderText(SEARCH_PLACEHOLDER),
    ).not.toBeInTheDocument();
    // Generic, rather than keyed off our placeholder text: `MuiTableToolbar`'s `SearchField` falls
    // back to a generic "Search" placeholder whenever the toolbar renders but `search` is unset, so a
    // toolbar leaking in unconditionally would still pass the placeholder-only check above.
    expect(page.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('offers a search box in the container', async () => {
    const page = render(
      <AssessmentsTable assessments={listData(containerRows(), true)} />,
    );

    expect(
      await page.findByPlaceholderText(SEARCH_PLACEHOLDER),
    ).toBeInTheDocument();
  });

  // Source course is searchable rather than filterable, matching the decision already recorded on
  // MarketplaceListingsTable: courses number in the hundreds and a menu would grow without bound.
  it('narrows to one listing by searching its source course', async () => {
    const user = userEvent.setup();
    const page = render(
      <AssessmentsTable assessments={listData(containerRows(), true)} />,
    );

    await user.type(
      await page.findByPlaceholderText(SEARCH_PLACEHOLDER),
      'Other Source',
    );

    expect(
      await page.findByRole('link', { name: 'Listed MCQ' }),
    ).toBeInTheDocument();
    expect(
      page.queryByRole('link', { name: 'Publish me 2' }),
    ).not.toBeInTheDocument();
    expect(
      page.queryByRole('link', { name: 'Taken down' }),
    ).not.toBeInTheDocument();
  });

  // The reason the Listing axis is a filter and not a search: these two rows are textually
  // identical, so no search string can separate them from the third.
  it('labels every row of one listing identically, using its newest title', async () => {
    const page = render(
      <AssessmentsTable assessments={listData(containerRows(), true)} />,
    );

    expect(
      await page.findAllByRole('link', { name: 'Publish me 2 · ID 4' }),
    ).toHaveLength(2);
    expect(
      page.getAllByRole('link', { name: 'Listed MCQ · ID 2' }),
    ).toHaveLength(1);
  });

  it('links a listing to its admin history page', async () => {
    const page = render(
      <AssessmentsTable assessments={listData(containerRows(), true)} />,
    );

    expect(
      await page.findByRole('link', { name: 'Listed MCQ · ID 2' }),
    ).toHaveAttribute('href', '/admin/marketplace_listings/2');
  });

  it('shows the Live chip only on the served snapshot of each published listing', async () => {
    const page = render(
      <AssessmentsTable assessments={listData(containerRows(), true)} />,
    );

    // Two published listings, one served snapshot each. The superseded cut and the unlisted
    // listing's newest cut are both excluded.
    expect(await page.findAllByText('Live')).toHaveLength(2);
  });

  // An unlisted listing still has a newest version — the one an admin re-publishing acts on — but
  // nothing is being served, so it must read Latest and never Live.
  it('marks an unlisted listing’s newest version Latest rather than Live', async () => {
    const page = render(
      <AssessmentsTable assessments={listData(containerRows(), true)} />,
    );

    expect(await page.findByText('Latest')).toBeInTheDocument();

    const takenDownRow = page
      .getByRole('link', { name: 'Taken down' })
      .closest('tr') as HTMLElement;
    expect(within(takenDownRow).getByText('Latest')).toBeInTheDocument();
    expect(within(takenDownRow).queryByText('Live')).not.toBeInTheDocument();
  });

  // Selecting Live is "what is the marketplace serving right now" in one click. The filter button is
  // addressed by its 'Filter' name because the header also holds a sort button.
  it('isolates what the marketplace is serving through the Version filter', async () => {
    const user = userEvent.setup();
    const page = render(
      <AssessmentsTable assessments={listData(containerRows(), true)} />,
    );

    const versionHeader = await page.findByRole('columnheader', {
      name: /Version/,
    });
    await user.click(
      within(versionHeader).getByRole('button', { name: 'Filter' }),
    );
    await user.click(await page.findByRole('menuitem', { name: 'Live' }));
    // An open MUI menu marks the rest of the page `aria-hidden`, so the table rows are unqueryable
    // until it is closed — matching the established pattern in MarketplaceListingsIndex.test.tsx.
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument(),
    );

    // Listing 4's 9:04 cut survives and its 9:01 sibling does not; listing 2's only cut survives;
    // the unlisted listing's newest cut is excluded because nothing of it is being served.
    expect(page.getAllByRole('link', { name: 'Publish me 2' })).toHaveLength(1);
    expect(page.getByRole('link', { name: 'Listed MCQ' })).toBeInTheDocument();
    expect(
      page.queryByRole('link', { name: 'Taken down' }),
    ).not.toBeInTheDocument();
  });

  // Unlike the all-or-nothing `assessments.length === 0` case (covered elsewhere), a search or
  // filter that matches nothing is reached with rows still in the payload, so the empty note has to
  // come from the table itself rather than a check before it.
  it('shows an empty state when the search matches nothing, but not while rows still match', async () => {
    const user = userEvent.setup();
    const page = render(
      <AssessmentsTable assessments={listData(containerRows(), true)} />,
    );

    const search = await page.findByPlaceholderText(SEARCH_PLACEHOLDER);

    expect(page.queryByText(NO_RESULTS_MESSAGE)).not.toBeInTheDocument();

    await user.type(search, 'No source course matches this string');

    expect(await page.findByText(NO_RESULTS_MESSAGE)).toBeInTheDocument();
  });

  it('leaves the Listing, Version and Source cells empty for an assessment authored in the container', async () => {
    const page = render(
      <AssessmentsTable
        assessments={listData(
          [assessment({ id: 9, title: 'Hand-made in the container' })],
          true,
        )}
      />,
    );

    expect(
      await page.findByRole('link', { name: 'Hand-made in the container' }),
    ).toBeInTheDocument();

    // Indexed off the row rather than counting em dashes across the whole table, so an unrelated
    // column rendering one cannot silently satisfy this.
    const cells = within(page.getAllByRole('row')[1]).getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('—');
    expect(cells[2]).toHaveTextContent('—');
    expect(cells[3]).toHaveTextContent('—');
  });
});
