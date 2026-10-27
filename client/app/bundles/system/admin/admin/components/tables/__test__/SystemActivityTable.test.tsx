import { fireEvent, render, screen, within } from 'test-utils';
import { InstanceActivityCounts } from 'types/system/activities';

import SystemActivityTable, { OVERALL_ROW_KEY } from '../SystemActivityTable';

const instances: InstanceActivityCounts[] = [
  {
    id: 1,
    name: 'Bravo',
    host: 'bravo.example.org',
    counts: [5, 1],
    previousCounts: null,
  },
  {
    id: 2,
    name: 'Alpha',
    host: 'alpha.example.org',
    counts: [3, 9],
    previousCounts: null,
  },
];

const renderTable = async (): Promise<void> => {
  render(
    <SystemActivityTable
      bucketLabels={['Jan', 'Feb']}
      csvFileName="Student activity"
      granularity="month"
      inProgressIndex={-1}
      instances={instances}
      onSelect={jest.fn()}
      overall={[8, 10]}
      selectedKey={OVERALL_ROW_KEY}
    />,
  );
  // TestApp loads locale messages asynchronously.
  await screen.findByText('Alpha');
};

const rowNames = (): string[] =>
  within(screen.getAllByRole('rowgroup')[1])
    .getAllByRole('row')
    .map((row) => row.querySelector('td')?.textContent ?? '');

describe('SystemActivityTable', () => {
  it.each(['Instance', 'Jan'])(
    'keeps Overall first when sorting by %s in either direction',
    async (column) => {
      await renderTable();
      const sortButton = screen.getByRole('button', { name: column });

      // TanStack starts text columns ascending and number columns descending, so only check that
      // the instances swap between the two directions while Overall stays put.
      fireEvent.click(sortButton);
      const [first, ...instanceOrder] = rowNames();
      expect(first).toBe('Overall');
      expect([...instanceOrder].sort()).toEqual(['Alpha', 'Bravo']);

      fireEvent.click(sortButton);
      expect(rowNames()).toEqual(['Overall', ...instanceOrder.reverse()]);
    },
  );

  it('keeps Overall when a search matches no part of its name', async () => {
    await renderTable();
    fireEvent.change(screen.getByPlaceholderText('Search instances'), {
      target: { value: 'Alph' },
    });

    expect(rowNames()).toEqual(['Overall', 'Alpha']);
  });
});
