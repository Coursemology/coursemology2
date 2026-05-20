import { fireEvent, render, screen } from '@testing-library/react';

import MuiColumnPickerDialog from '../MuiTableAdapter/MuiColumnPickerDialog';

const setup = (overrides: Partial<React.ComponentProps<typeof MuiColumnPickerDialog>> = {}) => {
  const commitColumnVisibility = jest.fn();
  const onExportFromPicker = jest.fn();
  const renderTree = jest.fn((ctx) => (
    <>
      <label>
        <input
          type="checkbox"
          checked={ctx.isVisible('name')}
          onChange={(e) => ctx.setVisible('name', e.target.checked)}
        />
        Name
      </label>
      <label>
        <input
          type="checkbox"
          checked={ctx.isVisible('email')}
          onChange={(e) => ctx.setVisible('email', e.target.checked)}
        />
        Email
      </label>
    </>
  ));
  const props = {
    open: true,
    onClose: jest.fn(),
    initialVisibility: { name: true, email: true },
    locked: ['name'],
    columnPicker: {
      renderTree,
      locked: ['name'],
      dialogTitle: 'Select columns',
      exportLabel: 'Export CSV',
      onExport: 'csv' as const,
    },
    commitColumnVisibility,
    onExportFromPicker,
    ...overrides,
  };
  return { ...render(<MuiColumnPickerDialog {...props} />), commitColumnVisibility, onExportFromPicker, renderTree, props };
};

describe('MuiColumnPickerDialog', () => {
  it('renders the dialog title', () => {
    setup();
    expect(screen.getByText('Select columns')).toBeInTheDocument();
  });

  it('Apply commits staged changes and closes', () => {
    const { commitColumnVisibility, props } = setup();
    fireEvent.click(screen.getByLabelText('Email'));        // toggle staged off
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(commitColumnVisibility).toHaveBeenCalledWith({ name: true, email: false });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('Cancel discards staged and closes without commit', () => {
    const { commitColumnVisibility, props } = setup();
    fireEvent.click(screen.getByLabelText('Email'));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(commitColumnVisibility).not.toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it('Export CSV commits + invokes onExportFromPicker + closes', () => {
    const { commitColumnVisibility, onExportFromPicker, props } = setup();
    fireEvent.click(screen.getByLabelText('Email'));
    fireEvent.click(screen.getByRole('button', { name: /export csv/i }));

    expect(commitColumnVisibility).toHaveBeenCalledWith({ name: true, email: false });
    expect(onExportFromPicker).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it('locked id forcibly restored to true on commit even if staged false', () => {
    const { commitColumnVisibility } = setup({
      initialVisibility: { name: false, email: true },     // malformed input
    });

    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(commitColumnVisibility).toHaveBeenCalledWith({ name: true, email: true });
  });

  it('Esc key dismisses the dialog via onClose', () => {
    const { props } = setup();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('dialog has an accessible labelled title (a11y)', () => {
    setup();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'column-picker-dialog-title');
    expect(screen.getByText('Select columns')).toHaveAttribute(
      'id',
      'column-picker-dialog-title',
    );
  });
});
