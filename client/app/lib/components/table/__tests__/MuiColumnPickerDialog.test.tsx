import { IntlProvider } from 'react-intl';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColumnPickerRenderCtx } from '../builder';
import MuiColumnPickerDialog from '../MuiTableAdapter/MuiColumnPickerDialog';

const DIALOG_TITLE = 'Select columns';

const wrap = (node: JSX.Element): JSX.Element => (
  <IntlProvider defaultLocale="en" locale="en">
    {node}
  </IntlProvider>
);

const makeRenderTree = (ids: readonly string[]): jest.Mock =>
  jest.fn((ctx: ColumnPickerRenderCtx) => (
    <>
      {ids.map((id) => (
        <label key={id}>
          <input
            checked={ctx.isVisible(id)}
            onChange={(e) => ctx.setVisible(id, e.target.checked)}
            type="checkbox"
          />
          {id}
        </label>
      ))}
    </>
  ));

const setup = (
  overrides: Partial<React.ComponentProps<typeof MuiColumnPickerDialog>> = {},
): ReturnType<typeof render> & {
  commitColumnVisibility: jest.Mock;
  onExportFromPicker: jest.Mock;
  renderTree: jest.Mock;
  props: React.ComponentProps<typeof MuiColumnPickerDialog>;
} => {
  const commitColumnVisibility = jest.fn();
  const onExportFromPicker = jest.fn();
  const renderTree = makeRenderTree(['name', 'email']);
  const props = {
    open: true,
    onClose: jest.fn(),
    initialVisibility: { name: true, email: true },
    locked: ['name'],
    columnPicker: {
      renderTree,
      dialogTitle: DIALOG_TITLE,
      exportLabel: 'Export CSV',
      onExport: 'csv' as const,
    },
    commitColumnVisibility,
    onExportFromPicker,
    ...overrides,
  };
  return {
    ...render(wrap(<MuiColumnPickerDialog {...props} />)),
    commitColumnVisibility,
    onExportFromPicker,
    renderTree,
    props,
  };
};

describe('MuiColumnPickerDialog', () => {
  it('renders the dialog title', () => {
    setup();
    expect(screen.getByText(DIALOG_TITLE)).toBeInTheDocument();
  });

  it('Apply commits staged changes and closes', async () => {
    const user = userEvent.setup();
    const { commitColumnVisibility, props } = setup();
    await user.click(screen.getByLabelText('email'));
    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(commitColumnVisibility).toHaveBeenCalledWith({
      name: true,
      email: false,
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('Cancel discards staged and closes without commit', async () => {
    const user = userEvent.setup();
    const { commitColumnVisibility, props } = setup();
    await user.click(screen.getByLabelText('email'));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(commitColumnVisibility).not.toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it('Export CSV commits + invokes onExportFromPicker + closes', async () => {
    const user = userEvent.setup();
    const { commitColumnVisibility, onExportFromPicker, props } = setup();
    await user.click(screen.getByLabelText('email'));
    await user.click(screen.getByRole('button', { name: /export csv/i }));

    expect(commitColumnVisibility).toHaveBeenCalledWith({
      name: true,
      email: false,
    });
    expect(onExportFromPicker).toHaveBeenCalledWith({
      name: true,
      email: false,
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('locked id forcibly restored to true on commit even if staged false', async () => {
    const user = userEvent.setup();
    const { commitColumnVisibility } = setup({
      initialVisibility: { name: false, email: true }, // malformed input
    });

    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(commitColumnVisibility).toHaveBeenCalledWith({
      name: true,
      email: true,
    });
  });

  describe('locked column behavior', () => {
    const makeGroupRenderTree = (ids: readonly string[]): jest.Mock =>
      jest.fn(
        (ctx: ColumnPickerRenderCtx): JSX.Element => (
          <>
            <button
              onClick={() => ctx.setManyVisible([...ids], false)}
              type="button"
            >
              Deselect all
            </button>
            <button
              onClick={() => ctx.setManyVisible([...ids], true)}
              type="button"
            >
              Select all
            </button>
          </>
        ),
      );

    it('deselect-all leaves the locked column checked', async () => {
      const user = userEvent.setup();
      const commitColumnVisibility = jest.fn();
      render(
        wrap(
          <MuiColumnPickerDialog
            columnPicker={{
              renderTree: makeGroupRenderTree(['name', 'email']),
              dialogTitle: DIALOG_TITLE,
              exportLabel: 'Export CSV',
              onExport: 'csv' as const,
            }}
            commitColumnVisibility={commitColumnVisibility}
            initialVisibility={{ name: true, email: true }}
            locked={['name']}
            onClose={jest.fn()}
            open
          />,
        ),
      );
      await user.click(screen.getByRole('button', { name: 'Deselect all' }));
      await user.click(screen.getByRole('button', { name: /apply/i }));
      expect(commitColumnVisibility).toHaveBeenCalledWith({
        name: true,
        email: false,
      });
    });

    it('select-all from indeterminate state selects non-locked column', async () => {
      const user = userEvent.setup();
      const commitColumnVisibility = jest.fn();
      render(
        wrap(
          <MuiColumnPickerDialog
            columnPicker={{
              renderTree: makeGroupRenderTree(['name', 'email']),
              dialogTitle: DIALOG_TITLE,
              exportLabel: 'Export CSV',
              onExport: 'csv' as const,
            }}
            commitColumnVisibility={commitColumnVisibility}
            initialVisibility={{ name: true, email: false }}
            locked={['name']}
            onClose={jest.fn()}
            open
          />,
        ),
      );
      await user.click(screen.getByRole('button', { name: 'Select all' }));
      await user.click(screen.getByRole('button', { name: /apply/i }));
      expect(commitColumnVisibility).toHaveBeenCalledWith({
        name: true,
        email: true,
      });
    });

    it('clicking a locked column checkbox has no effect on its visibility', async () => {
      const user = userEvent.setup();
      const { commitColumnVisibility } = setup();
      await user.click(screen.getByLabelText('name'));
      await user.click(screen.getByRole('button', { name: /apply/i }));
      expect(commitColumnVisibility).toHaveBeenCalledWith({
        name: true,
        email: true,
      });
    });
  });

  it('Esc key dismisses without committing', () => {
    const { commitColumnVisibility, props } = setup();
    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(props.onClose).toHaveBeenCalled();
    expect(commitColumnVisibility).not.toHaveBeenCalled();
  });

  describe('noDataColumnsHint', () => {
    const dataSetup = (
      dataColumnIds: string[],
      initialVisibility: Record<string, boolean>,
    ): ReturnType<typeof setup> =>
      setup({
        initialVisibility,
        columnPicker: {
          renderTree: makeRenderTree(['name', 'grade']),
          dialogTitle: DIALOG_TITLE,
          exportLabel: 'Export CSV',
          onExport: 'csv' as const,
          dataColumnIds,
          noDataColumnsHint: 'No grade columns selected.',
        },
      });

    it('shows hint when no data columns are selected', () => {
      dataSetup(['grade'], { name: true, grade: false });
      expect(
        screen.getByText('No grade columns selected.'),
      ).toBeInTheDocument();
    });

    it('hides hint when at least one data column is selected', () => {
      dataSetup(['grade'], { name: true, grade: true });
      expect(
        screen.queryByText('No grade columns selected.'),
      ).not.toBeInTheDocument();
    });

    it('Export button is enabled even when no data columns are selected', () => {
      dataSetup(['grade'], { name: true, grade: false });
      expect(
        screen.getByRole('button', { name: /export csv/i }),
      ).not.toBeDisabled();
    });

    it('Apply button is enabled even when no data columns are selected', () => {
      dataSetup(['grade'], { name: true, grade: false });
      expect(screen.getByRole('button', { name: /apply/i })).not.toBeDisabled();
    });
  });
});
