import { fireEvent, render, screen } from '@testing-library/react';

import { ColumnPickerRenderCtx } from '../builder';
import ColumnPickerTreeGroup from '../MuiTableAdapter/ColumnPickerTreeGroup';

const makeCtx = (
  visible: Record<string, boolean>,
): ColumnPickerRenderCtx & { setManyVisible: jest.Mock } => ({
  isVisible: (id) => visible[id] ?? false,
  setVisible: jest.fn(),
  setManyVisible: jest.fn(),
});

describe('ColumnPickerTreeGroup', () => {
  describe('parent checkbox state mirrors children visibility', () => {
    it('is checked when all children are visible', () => {
      const ctx = makeCtx({ a: true, b: true });
      render(
        <ColumnPickerTreeGroup childIds={['a', 'b']} ctx={ctx} label="Group">
          <span />
        </ColumnPickerTreeGroup>,
      );
      expect(screen.getByRole('checkbox', { name: 'Group' })).toBeChecked();
    });

    it('is unchecked and not indeterminate when no children are visible', () => {
      const ctx = makeCtx({ a: false, b: false });
      render(
        <ColumnPickerTreeGroup childIds={['a', 'b']} ctx={ctx} label="Group">
          <span />
        </ColumnPickerTreeGroup>,
      );
      const checkbox = screen.getByRole('checkbox', { name: 'Group' });
      expect(checkbox).not.toBeChecked();
      expect(checkbox.getAttribute('data-indeterminate')).toBe('false');
    });

    it('is indeterminate and not checked when some but not all children are visible', () => {
      const ctx = makeCtx({ a: true, b: false });
      render(
        <ColumnPickerTreeGroup childIds={['a', 'b']} ctx={ctx} label="Group">
          <span />
        </ColumnPickerTreeGroup>,
      );
      const checkbox = screen.getByRole('checkbox', { name: 'Group' });
      expect(checkbox).not.toBeChecked();
      expect(checkbox.getAttribute('data-indeterminate')).toBe('true');
    });
  });

  describe('cascading toggle', () => {
    it('calls setManyVisible(childIds, true) when parent is clicked while unchecked', () => {
      const ctx = makeCtx({ a: false, b: false });
      render(
        <ColumnPickerTreeGroup childIds={['a', 'b']} ctx={ctx} label="Group">
          <span />
        </ColumnPickerTreeGroup>,
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'Group' }));
      expect(ctx.setManyVisible).toHaveBeenCalledWith(['a', 'b'], true);
    });

    it('calls setManyVisible(childIds, false) when parent is clicked while checked', () => {
      const ctx = makeCtx({ a: true, b: true });
      render(
        <ColumnPickerTreeGroup childIds={['a', 'b']} ctx={ctx} label="Group">
          <span />
        </ColumnPickerTreeGroup>,
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'Group' }));
      expect(ctx.setManyVisible).toHaveBeenCalledWith(['a', 'b'], false);
    });

    it('calls setManyVisible(childIds, true) when parent is clicked while indeterminate', () => {
      const ctx = makeCtx({ a: true, b: false });
      render(
        <ColumnPickerTreeGroup childIds={['a', 'b']} ctx={ctx} label="Group">
          <span />
        </ColumnPickerTreeGroup>,
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'Group' }));
      expect(ctx.setManyVisible).toHaveBeenCalledWith(['a', 'b'], true);
    });
  });

  describe('locked behavior', () => {
    it('disables the parent checkbox when all children are locked', () => {
      const ctx = makeCtx({ a: true, b: true });
      render(
        <ColumnPickerTreeGroup
          childIds={['a', 'b']}
          ctx={ctx}
          label="Group"
          locked={['a', 'b']}
        >
          <span />
        </ColumnPickerTreeGroup>,
      );
      expect(screen.getByRole('checkbox', { name: 'Group' })).toBeDisabled();
    });

    it('does not disable the parent when only some children are locked', () => {
      const ctx = makeCtx({ a: true, b: true });
      render(
        <ColumnPickerTreeGroup
          childIds={['a', 'b']}
          ctx={ctx}
          label="Group"
          locked={['a']}
        >
          <span />
        </ColumnPickerTreeGroup>,
      );
      expect(
        screen.getByRole('checkbox', { name: 'Group' }),
      ).not.toBeDisabled();
    });

    it('does not disable the parent when no children are locked', () => {
      const ctx = makeCtx({ a: true, b: true });
      render(
        <ColumnPickerTreeGroup childIds={['a', 'b']} ctx={ctx} label="Group">
          <span />
        </ColumnPickerTreeGroup>,
      );
      expect(
        screen.getByRole('checkbox', { name: 'Group' }),
      ).not.toBeDisabled();
    });
  });

  it('renders children below the parent checkbox', () => {
    const ctx = makeCtx({});
    render(
      <ColumnPickerTreeGroup childIds={[]} ctx={ctx} label="Group">
        <span data-testid="child-node">Child</span>
      </ColumnPickerTreeGroup>,
    );
    expect(screen.getByTestId('child-node')).toBeInTheDocument();
  });
});
