import { fireEvent, render, screen, within } from 'test-utils';

import { TableTemplate } from '../builder';
import Table, { ColumnTemplate } from '..';

interface Row {
  key: string;
  name: string;
}

const rows: Row[] = [
  { key: 'total', name: 'Total' },
  { key: 'b', name: 'Bravo' },
  { key: 'a', name: 'Alpha' },
];

const columns: ColumnTemplate<Row>[] = [
  { of: 'name', title: 'Name', cell: (row) => row.name, searchable: true },
];

// TestApp loads locale messages asynchronously, so wait for the first row before searching.
const renderAndSearch = async (
  search: TableTemplate<Row>['search'],
  keyword: string,
): Promise<void> => {
  render(
    <Table
      columns={columns}
      data={rows}
      getRowId={(row): string => row.key}
      search={search}
      toolbar={{ show: true }}
    />,
  );
  await screen.findByText('Alpha');
  fireEvent.change(screen.getByPlaceholderText('Search'), {
    target: { value: keyword },
  });
};

const bodyRowNames = (): string[] =>
  within(screen.getAllByRole('rowgroup')[1])
    .getAllByRole('row')
    .map((row) => row.textContent ?? '');

describe('Table search.alwaysInclude', () => {
  it('keeps matching rows plus the always-included ones', async () => {
    await renderAndSearch(
      {
        searchPlaceholder: 'Search',
        alwaysInclude: (row): boolean => row.key === 'total',
      },
      'alp',
    );

    expect(bodyRowNames()).toEqual(['Total', 'Alpha']);
  });

  it('matches as usual without it', async () => {
    await renderAndSearch({ searchPlaceholder: 'Search' }, 'alp');

    expect(bodyRowNames()).toEqual(['Alpha']);
  });
});
