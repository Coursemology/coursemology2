import userEvent from '@testing-library/user-event';
import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import MarketplaceIndex from '../index';

jest.mock('../../../../container/CourseLoader', () => ({
  useCourseContext: (): { courseTitle: string; courseUrl: string } => ({
    courseTitle: 'Test Course',
    courseUrl: '/courses/4',
  }),
}));

const mock = createMockAdapter(CourseAPI.marketplace.client);
beforeEach(() => mock.reset());

// Fixture chosen so the two sort keys DISAGREE: Graph Theory is most-adopted but oldest;
// Recursion Drills is fewer adoptions but newest. This lets the sort tests prove the mode
// actually changes order rather than passing on a coincidental tie.
const LISTINGS = [
  {
    id: 1,
    assessmentId: 10,
    title: 'Recursion Drills',
    questionCount: 8,
    adoptions: 5,
    firstPublishedAt: '2026-06-01T00:00:00Z',
    previewUrl: '/p/1',
    duplicateUrl: '/d',
  },
  {
    id: 2,
    assessmentId: 11,
    title: 'Graph Theory',
    questionCount: 3,
    adoptions: 12,
    firstPublishedAt: '2026-01-01T00:00:00Z',
    previewUrl: '/p/2',
    duplicateUrl: '/d',
  },
];

const url = `/courses/${global.courseId}/marketplace`;
const renderPage = async (page): Promise<void> => {
  await waitFor(() => expect(page.getByText('Graph Theory')).toBeVisible());
};

it('renders published listings sorted by most adopted by default', async () => {
  mock.onGet(url).reply(200, { listings: LISTINGS, canAccess: true });
  const page = render(<MarketplaceIndex />, { at: [url] });
  await renderPage(page);

  const rows = page.getAllByRole('row');
  // Graph Theory (12 adoptions) precedes Recursion Drills (5) by default.
  expect(rows[1]).toHaveTextContent('Graph Theory');
});

it('re-sorts by newest when the sort mode changes', async () => {
  mock.onGet(url).reply(200, { listings: LISTINGS, canAccess: true });
  const page = render(<MarketplaceIndex />, { at: [url] });
  await renderPage(page);

  // Open the MUI "Sort by" select and choose Newest.
  // NOTE (executor): confirm the exact idiom for driving a MUI `select`-mode TextField
  // against an existing table test (e.g. mouseDown the combobox, then click the option).
  fireEvent.mouseDown(page.getByLabelText('Sort by'));
  fireEvent.click(page.getByRole('option', { name: 'Newest' }));

  await waitFor(() => {
    const rows = page.getAllByRole('row');
    // Recursion Drills (2026-06) is newest and must now lead.
    expect(rows[1]).toHaveTextContent('Recursion Drills');
  });
});

it('filters rows by the title search', async () => {
  mock.onGet(url).reply(200, { listings: LISTINGS, canAccess: true });
  const page = render(<MarketplaceIndex />, { at: [url] });
  await renderPage(page);

  // Search field must be driven with userEvent (React 18 startTransition) — see client/CLAUDE-testing.md.
  await userEvent.type(page.getByPlaceholderText('Search by title'), 'Graph');

  await waitFor(() =>
    expect(page.queryByText('Recursion Drills')).not.toBeInTheDocument(),
  );
  expect(page.getByText('Graph Theory')).toBeVisible();
});

it('carries from_tab into the preview links', async () => {
  mock.onGet(url).reply(200, { listings: LISTINGS, canAccess: true });
  const page = render(<MarketplaceIndex />, { at: [`${url}?from_tab=7`] });
  await renderPage(page);

  const previews = page.getAllByLabelText('Preview');
  expect(previews.map((el) => el.getAttribute('href'))).toEqual(
    expect.arrayContaining(['/p/1?from_tab=7', '/p/2?from_tab=7']),
  );
});

it('opens the confirmation with the resolved destination tab', async () => {
  mock.onGet(url).reply(200, {
    listings: LISTINGS,
    canAccess: true,
    destinationTabs: [
      { id: 7, title: 'Assignments', categoryId: 3, categoryTitle: 'Missions' },
    ],
  });
  const page = render(<MarketplaceIndex />, { at: [`${url}?from_tab=7`] });
  await renderPage(page);

  fireEvent.click(page.getAllByLabelText('Duplicate')[0]);

  expect(await page.findByText('Test Course')).toBeVisible();
  expect(page.getByText('Missions')).toBeVisible();
  expect(page.getByText('Assignments')).toBeVisible();
});
