import userEvent from '@testing-library/user-event';
import { fireEvent, render, waitFor } from 'test-utils';

import { MarketplaceListing } from '../../../types';
import MarketplaceTable from '../MarketplaceTable';

// Sort keys disagree so order is meaningful: Graph Theory is most-adopted, Recursion newest.
const GRAPH_THEORY = 'Graph Theory';
const LISTINGS: MarketplaceListing[] = [
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
    title: GRAPH_THEORY,
    questionCount: 3,
    adoptions: 12,
    firstPublishedAt: '2026-01-01T00:00:00Z',
    previewUrl: '/p/2',
    duplicateUrl: '/d',
  },
];

it('shows a disabled "Select to duplicate" button when nothing is selected', async () => {
  const page = render(
    <MarketplaceTable listings={LISTINGS} onDuplicate={jest.fn()} />,
  );
  // findBy: test-utils wraps the tree in a translations Suspense (LoadingIndicator fallback).
  const idle = await page.findByRole('button', { name: 'Select to duplicate' });
  expect(idle).toBeDisabled();
});

it('renders Preview, Attempt, and Duplicate as icon buttons with one-word tooltips/labels', async () => {
  const onDuplicate = jest.fn();
  const page = render(
    <MarketplaceTable listings={LISTINGS} onDuplicate={onDuplicate} />,
  );

  const previews = await page.findAllByLabelText('Preview');
  previews.forEach((el) => expect(el).not.toHaveAttribute('target'));
  expect(previews.map((el) => el.getAttribute('href'))).toEqual(
    expect.arrayContaining(['/p/1', '/p/2']),
  );

  const attempts = await page.findAllByLabelText('Attempt');
  expect(attempts.map((el) => el.getAttribute('href'))).toEqual(
    expect.arrayContaining(['/p/1/attempt', '/p/2/attempt']),
  );

  const duplicates = await page.findAllByLabelText('Duplicate');
  // Default sort = adoptions desc → Graph Theory (12) is the first row.
  fireEvent.click(duplicates[0]);
  expect(onDuplicate).toHaveBeenCalledWith([
    expect.objectContaining({ title: GRAPH_THEORY }),
  ]);
});

it('carries from_tab into the preview links when set', async () => {
  const page = render(
    <MarketplaceTable
      fromTab="42"
      listings={LISTINGS}
      onDuplicate={jest.fn()}
    />,
  );
  const previews = await page.findAllByLabelText('Preview');
  expect(previews.map((el) => el.getAttribute('href'))).toEqual(
    expect.arrayContaining(['/p/1?from_tab=42', '/p/2?from_tab=42']),
  );

  const attempts = await page.findAllByLabelText('Attempt');
  expect(attempts.map((el) => el.getAttribute('href'))).toEqual(
    expect.arrayContaining([
      '/p/1/attempt?from_tab=42',
      '/p/2/attempt?from_tab=42',
    ]),
  );
});

it('shows a loading indicator after clicking Attempt', async () => {
  const page = render(
    <MarketplaceTable listings={LISTINGS} onDuplicate={jest.fn()} />,
  );
  const attempts = await page.findAllByLabelText('Attempt');

  await userEvent.click(attempts[0]);

  expect(page.getByRole('progressbar')).toBeVisible();
});

it('renders one checkbox per row and no select-all header checkbox', async () => {
  const page = render(
    <MarketplaceTable listings={LISTINGS} onDuplicate={jest.fn()} />,
  );
  await page.findByText(GRAPH_THEORY);

  // Only per-row checkboxes — the select-all header checkbox is removed.
  expect(page.getAllByRole('checkbox')).toHaveLength(LISTINGS.length);
});

it('keeps the search bar visible and shows an enabled count button on selection', async () => {
  const onDuplicate = jest.fn();
  const page = render(
    <MarketplaceTable listings={LISTINGS} onDuplicate={onDuplicate} />,
  );
  await page.findByText(GRAPH_THEORY);

  // Data-row checkboxes follow any header checkbox — click the last one to select a row.
  const checkboxes = page.getAllByRole('checkbox');
  fireEvent.click(checkboxes[checkboxes.length - 1]);

  // Regression for the vanishing-search bug: search must remain after selection.
  expect(page.getByPlaceholderText('Search by title')).toBeVisible();

  const bulk = page.getByRole('button', { name: 'Duplicate 1 assessment' });
  expect(bulk).toBeEnabled();
  fireEvent.click(bulk);
  expect(onDuplicate).toHaveBeenCalledTimes(1);
  expect(onDuplicate.mock.calls[0][0]).toHaveLength(1);
});

it('paginates to the default page size of 20', async () => {
  const many: MarketplaceListing[] = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    assessmentId: 100 + i,
    title: `Listing ${String(i).padStart(2, '0')}`,
    questionCount: 1,
    adoptions: 25 - i, // Listing 00 highest → page 1; Listing 24 lowest → page 2
    firstPublishedAt: '2026-01-01T00:00:00Z',
    previewUrl: `/p/${i}`,
    duplicateUrl: '/d',
  }));

  const page = render(
    <MarketplaceTable listings={many} onDuplicate={jest.fn()} />,
  );
  await page.findByText('Listing 00');
  expect(page.queryByText('Listing 24')).not.toBeInTheDocument();
});

it('shows a no-match message when the search filters everything, keeping the search bar', async () => {
  const page = render(
    <MarketplaceTable listings={LISTINGS} onDuplicate={jest.fn()} />,
  );
  await page.findByText(GRAPH_THEORY);

  // userEvent (not fireEvent) for the search field — React 18 startTransition.
  await userEvent.type(page.getByPlaceholderText('Search by title'), 'zzzzz');

  await waitFor(() =>
    expect(page.getByText('No assessments match your search.')).toBeVisible(),
  );
  // The search bar must remain so the user can clear the query.
  expect(page.getByPlaceholderText('Search by title')).toBeVisible();
});

it('shows an empty-marketplace message when there are no listings at all', async () => {
  const page = render(
    <MarketplaceTable listings={[]} onDuplicate={jest.fn()} />,
  );
  expect(
    await page.findByText(
      'No assessments have been published to the marketplace yet.',
    ),
  ).toBeVisible();
});

it('shows the published date, formatted', async () => {
  const page = render(
    <MarketplaceTable listings={LISTINGS} onDuplicate={jest.fn()} />,
  );
  await page.findByText(GRAPH_THEORY);
  // formatLongDate('2026-06-01T00:00:00Z') under TZ=Asia/Singapore → '01 Jun 2026'.
  expect(page.getByText('01 Jun 2026')).toBeVisible();
  expect(page.getByText('01 Jan 2026')).toBeVisible();
});

it('sorts by published date (not adoptions) when Newest is selected', async () => {
  const onDuplicate = jest.fn();
  const page = render(
    <MarketplaceTable listings={LISTINGS} onDuplicate={onDuplicate} />,
  );
  await page.findByText(GRAPH_THEORY);

  // Drive the MUI select-mode "Sort by" TextField (idiom mirrored from the sibling
  // MarketplaceIndex test): mouseDown the labelled control, then click the option.
  fireEvent.mouseDown(page.getByLabelText('Sort by'));
  fireEvent.click(page.getByRole('option', { name: 'Newest' }));

  // Recursion Drills has the most recent firstPublishedAt (2026-06) despite fewer adoptions,
  // so it must lead. Icon buttons render in row order, so the first Duplicate button belongs
  // to the first row.
  const duplicates = await page.findAllByLabelText('Duplicate');
  fireEvent.click(duplicates[0]);
  expect(onDuplicate).toHaveBeenCalledWith([
    expect.objectContaining({ title: 'Recursion Drills' }),
  ]);
});
