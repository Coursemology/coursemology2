import { ChangeEventHandler } from 'react';

interface RowSelector {
  selected: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const isRowSelector = (value: unknown): value is RowSelector => {
  const probablyRowSelector = value as RowSelector;

  return (
    probablyRowSelector?.selected !== undefined &&
    probablyRowSelector?.indeterminate !== undefined
  );
};

export default RowSelector;
