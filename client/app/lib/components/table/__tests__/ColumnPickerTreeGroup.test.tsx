import { fireEvent, render, screen } from '@testing-library/react';

import ColumnPickerTreeGroup from '../MuiTableAdapter/ColumnPickerTreeGroup';
import { ColumnPickerRenderCtx } from '../builder';

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
        <ColumnPickerTreeGroup label="Group" childIds={['a', 'b']} ctx={ctx}>
          <span />
        </ColumnPickerTreeGroup>,
      );
      expect(screen.getByRole('checkbox', { name: 'Group' })).toBeChecked();
    });

    it('is unchecked and not indeterminate when no children are visible', () => {
      const ctx = makeCtx({ a: false, b: false });
      render(
        <ColumnPickerTreeGroup label="Group" childIds={['a', 'b']} ctx={ctx}>
          <span />
        </ColumnPickerTreeGroup>,
      );
      const checkbox = screen.getByRole('checkbox', { name: 'Group' });
      expect(checkbox).not.toBeChecked();
      expect((checkbox as HTMLInputElement).indeterminate).toBe(false);
    });

    it('is not checked when some but not all children are visible', () => {
      const ctx = makeCtx({ a: true, b: false });
      render(
        <ColumnPickerTreeGroup label="Group" childIds={['a', 'b']} ctx={ctx}>
          <span />
        </ColumnPickerTreeGroup>,
      );
      expect(screen.getByRole('checkbox', { name: 'Group' })).not.toBeChecked();
    });
  });

  describe('cascading toggle', () => {
    it('calls setManyVisible(childIds, true) when parent is clicked while unchecked', () => {
      const ctx = makeCtx({ a: false, b: false });
      render(
        <ColumnPickerTreeGroup label="Group" childIds={['a', 'b']} ctx={ctx}>
          <span />
        </ColumnPickerTreeGroup>,
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'Group' }));
      expect(ctx.setManyVisible).toHaveBeenCalledWith(['a', 'b'], true);
    });

    it('calls setManyVisible(childIds, false) when parent is clicked while checked', () => {
      const ctx = makeCtx({ a: true, b: true });
      render(
        <ColumnPickerTreeGroup label="Group" childIds={['a', 'b']} ctx={ctx}>
          <span />
        </ColumnPickerTreeGroup>,
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'Group' }));
      expect(ctx.setManyVisible).toHaveBeenCalledWith(['a', 'b'], false);
    });

    it('calls setManyVisible(childIds, true) when parent is clicked while indeterminate', () => {
      const ctx = makeCtx({ a: true, b: false });
      render(
        <ColumnPickerTreeGroup label="Group" childIds={['a', 'b']} ctx={ctx}>
          <span />
        </ColumnPickerTreeGroup>,
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'Group' }));
      expect(ctx.setManyVisible).toHaveBeenCalledWith(['a', 'b'], true);
    });

    it('passes all childIds regardless of how many children there are', () => {
      const ids = ['x', 'y', 'z'];
      const ctx = makeCtx({ x: false, y: false, z: false });
      render(
        <ColumnPickerTreeGroup label="Group" childIds={ids} ctx={ctx}>
          <span />
        </ColumnPickerTreeGroup>,
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'Group' }));
      expect(ctx.setManyVisible).toHaveBeenCalledWith(ids, true);
    });
  });

  describe('locked behavior', () => {
    it('disables the parent checkbox when all children are locked', () => {
      const ctx = makeCtx({ a: true, b: true });
      render(
        <ColumnPickerTreeGroup
          label="Group"
          childIds={['a', 'b']}
          ctx={ctx}
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
          label="Group"
          childIds={['a', 'b']}
          ctx={ctx}
          locked={['a']}
        >
          <span />
        </ColumnPickerTreeGroup>,
      );
      expect(screen.getByRole('checkbox', { name: 'Group' })).not.toBeDisabled();
    });

    it('does not disable the parent when no children are locked', () => {
      const ctx = makeCtx({ a: true, b: true });
      render(
        <ColumnPickerTreeGroup label="Group" childIds={['a', 'b']} ctx={ctx}>
          <span />
        </ColumnPickerTreeGroup>,
      );
      expect(screen.getByRole('checkbox', { name: 'Group' })).not.toBeDisabled();
    });
  });

  it('renders children below the parent checkbox', () => {
    const ctx = makeCtx({});
    render(
      <ColumnPickerTreeGroup label="Group" childIds={[]} ctx={ctx}>
        <span data-testid="child-node">Child</span>
      </ColumnPickerTreeGroup>,
    );
    expect(screen.getByTestId('child-node')).toBeInTheDocument();
  });
});
