import { fireEvent, render, screen } from 'test-utils';

import { TableTemplate } from '../builder';
import Table, { ColumnTemplate } from '..';

interface Row {
  key: string;
  name: string;
}

const rows: Row[] = [
  { key: 'b', name: 'Bravo' },
  { key: 'a', name: 'Alpha' },
];

const columns: ColumnTemplate<Row>[] = [
  { of: 'name', title: 'Name', cell: (row) => row.name },
];

// TestApp loads locale messages asynchronously, so wait for the first row before asserting.
const renderTable = async (
  props: Partial<TableTemplate<Row>> = {},
): Promise<void> => {
  render(
    <Table
      columns={columns}
      data={rows}
      getRowId={(row): string => row.key}
      {...props}
    />,
  );
  await screen.findByText('Alpha');
};

describe('Table onRowClick', () => {
  it('calls onRowClick with the row on click, Enter and Space', async () => {
    const onRowClick = jest.fn();
    await renderTable({ onRowClick });
    const alphaRow = screen.getByText('Alpha').closest('tr')!;

    fireEvent.click(alphaRow);
    fireEvent.keyDown(alphaRow, { key: 'Enter' });
    fireEvent.keyDown(alphaRow, { key: ' ' });

    expect(onRowClick).toHaveBeenCalledTimes(3);
    expect(onRowClick).toHaveBeenCalledWith(rows[1]);
    expect(alphaRow).toHaveAttribute('tabindex', '0');
  });

  it('leaves rows unfocusable without onRowClick', async () => {
    await renderTable();

    expect(screen.getByText('Alpha').closest('tr')).not.toHaveAttribute(
      'tabindex',
    );
  });
});
