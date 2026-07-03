import userEvent from '@testing-library/user-event';
import { render, screen, within } from 'test-utils';
import TestApp from 'utilities/TestApp';

import ColumnMappingTable from '../ColumnMappingTable';
import type { ColumnState } from '../importValidation';

jest.mock('lib/components/wrappers/I18nProvider');

const col = (over: Partial<ColumnState>): ColumnState => ({
  header: 'H',
  action: 'create',
  newTitle: 'H',
  newMaxGrade: 100,
  newWeight: 0,
  existingTarget: '',
  status: 'ok',
  badCells: [],
  hasNumericData: true,
  ...over,
});

const noop = jest.fn();

const renderTable = (
  columns: ColumnState[],
  over: Record<string, unknown> = {},
): ReturnType<typeof render> =>
  render(
    <ColumnMappingTable
      columns={columns}
      existing={[
        { name: 'Final', maximumGrade: 80, weight: 20 },
        { name: 'Other', maximumGrade: 50, weight: 5 },
      ]}
      setColumnAction={noop}
      setCreateMaxGrade={noop}
      setCreateTitle={noop}
      setCreateWeight={noop}
      setExistingTarget={noop}
      weightedViewEnabled={false}
      {...over}
    />,
  );

const rowFor = (header: string): HTMLElement =>
  screen.getByText(header).closest('tr') as HTMLElement;

it('renders every column as a row in the given (CSV) order', () => {
  renderTable([
    col({ header: 'Project', action: 'ignore' }),
    col({ header: 'Quiz 1', action: 'create', newTitle: 'Quiz 1' }),
    col({ header: 'Final', action: 'existing', existingTarget: 'Final' }),
  ]);
  const headers = screen
    .getAllByRole('row')
    .slice(1) // drop the header row
    .map((r) => within(r).getAllByRole('cell')[0].textContent);
  expect(headers).toEqual(['Project', 'Quiz 1', 'Final']);
});

it('shows a create row with an editable title and max-marks default', () => {
  renderTable([
    col({ header: 'Quiz 1', action: 'create', newTitle: 'Quiz 1' }),
  ]);
  expect(screen.getByDisplayValue('Quiz 1')).toBeInTheDocument();
  expect(screen.getByDisplayValue('100')).toBeInTheDocument();
});

it('shows dashes for a do-not-import row', () => {
  renderTable([col({ header: 'Project', action: 'ignore' })]);
  const row = rowFor('Project');
  // Title / Max cells show an em-dash placeholder, no inputs
  expect(within(row).queryByRole('textbox')).toBeNull();
  expect(within(row).getAllByText('–').length).toBeGreaterThanOrEqual(2);
});

it('shows the placeholder for an unmapped existing row without any error text', () => {
  renderTable([
    col({
      header: 'Final',
      action: 'existing',
      existingTarget: '',
      status: 'incomplete',
    }),
  ]);
  expect(screen.getByText(/select component/i)).toBeInTheDocument();
  // incomplete is quiet: no red collision/duplicate copy
  expect(screen.queryByText(/already used|another column/i)).toBeNull();
});

it('shows the existing component max (looked up from the existing prop) as read-only', () => {
  // existing prop has Final -> maximumGrade 80; the table looks it up itself.
  renderTable([
    col({ header: 'Final', action: 'existing', existingTarget: 'Final' }),
  ]);
  const input = screen.getByDisplayValue('80') as HTMLInputElement;
  expect(input).toBeDisabled();
});

it('renders the Weight column only when weighted view is on', () => {
  const columns = [col({ header: 'Quiz 1', action: 'create' })];
  const { rerender } = renderTable(columns);
  expect(screen.queryByText(/weight/i)).toBeNull();

  // rerender bypasses test-utils' TestApp wrapper, so re-wrap to keep providers.
  rerender(
    <TestApp>
      <ColumnMappingTable
        columns={columns}
        existing={[]}
        setColumnAction={noop}
        setCreateMaxGrade={noop}
        setCreateTitle={noop}
        setCreateWeight={noop}
        setExistingTarget={noop}
        weightedViewEnabled
      />
    </TestApp>,
  );
  expect(screen.getByText(/^weight$/i)).toBeInTheDocument();
});

it('shows an inline error for a title collision', () => {
  renderTable([
    col({
      header: 'Score',
      action: 'create',
      newTitle: 'Final',
      status: 'error',
      error: 'titleCollision',
    }),
  ]);
  expect(
    screen.getByText(/already used by an existing external assessment/i),
  ).toBeInTheDocument();
});

it('shows an inline non-numeric error naming the first bad cell', () => {
  renderTable([
    col({
      header: 'Midterm',
      action: 'create',
      status: 'error',
      error: 'nonNumeric',
      badCells: [{ row: 5, value: 'absnt' }],
    }),
  ]);
  expect(screen.getByText(/absnt/)).toBeInTheDocument();
});

it('shows every existing option even when one is already taken by another row', async () => {
  renderTable([
    col({ header: 'Quiz 1', action: 'existing', existingTarget: 'Final' }),
    col({
      header: 'Quiz 2',
      action: 'existing',
      existingTarget: '',
      status: 'incomplete',
    }),
  ]);
  // Each existing row has two comboboxes (Action + Title). Scope to Quiz 2's
  // row and take its Title select (the second combobox in that row).
  const quiz2Row = rowFor('Quiz 2');
  const titleSelect = within(quiz2Row).getAllByRole('combobox')[1];
  await userEvent.click(titleSelect);
  // Options render in a portal on the document body, so query via screen.
  // Both existing components are offered - even 'Final', taken by Quiz 1 -
  // because collisions are caught by validation, not hidden from the list.
  expect(screen.getByRole('option', { name: 'Final' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
});

it('shows a quiet footer hint when a column still needs input', () => {
  renderTable([
    col({
      header: 'Final',
      action: 'existing',
      existingTarget: '',
      status: 'incomplete',
    }),
  ]);
  expect(screen.getByText(/finish mapping/i)).toBeInTheDocument();
});

it('shows a quiet footer hint when nothing is set to import', () => {
  renderTable([col({ header: 'Project', action: 'ignore' })]);
  expect(screen.getByText(/at least one column/i)).toBeInTheDocument();
});

it('renders the helper line explaining the numeric rule without inviting text imports', () => {
  renderTable([col({ header: 'Quiz 1', action: 'create' })]);
  expect(
    screen.getByText(/Grade columns must contain only numbers/i),
  ).toBeInTheDocument();
  // Text columns are unimportable (validation blocks them), so the copy must
  // not promise the user can "import it anyway".
  expect(screen.queryByText(/import it anyway/i)).toBeNull();
});

it('shows a grey non-grade note for an ignore column with no numeric data', () => {
  renderTable([
    col({ header: 'Name', action: 'ignore', hasNumericData: false }),
  ]);
  expect(
    screen.getByText(/no numeric values found. Treated as a non-grade column/i),
  ).toBeInTheDocument();
});

it('does not show the non-grade note for an ignore column that has numeric data', () => {
  renderTable([
    col({ header: 'Score', action: 'ignore', hasNumericData: true }),
  ]);
  expect(screen.queryByText(/non-grade column/i)).toBeNull();
});
