import { memo } from 'react';
import { TableCell, TableRow, TableRowProps } from '@mui/material';
import equal from 'fast-deep-equal';

import { isRowSelector } from '../adapters';
import { CellRender, RowRender } from '../adapters/Body';

import MuiTableRowSelector from './MuiTableRowSelector';

interface MuiTableRowProps<C> extends RowRender {
  getCells: () => C[];
  forEachCell: (cell: C, index: number) => CellRender;
}

// Clickable rows are also focusable and respond to Enter and Space, so they work without a mouse.
const getClickableRowProps = (onClick?: () => void): Partial<TableRowProps> =>
  onClick
    ? {
        hover: true,
        onClick,
        tabIndex: 0,
        onKeyDown: (event): void => {
          if (event.target !== event.currentTarget) return;
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onClick();
        },
      }
    : {};

const MuiTableRow = <C,>(props: MuiTableRowProps<C>): JSX.Element => (
  <TableRow
    className={`${props.className ?? ''} ${props.onClick ? 'cursor-pointer' : ''}`}
    {...getClickableRowProps(props.onClick)}
  >
    {props
      .getCells()
      .map((cell, cellIndex) => props.forEachCell(cell, cellIndex))
      .filter((cellProps) => !cellProps.shouldNotRender)
      .map((cellProps) => {
        return (
          <TableCell
            key={cellProps.id}
            className={cellProps.className}
            colSpan={cellProps.colSpan}
          >
            {isRowSelector(cellProps.render) ? (
              <MuiTableRowSelector {...cellProps.render} />
            ) : (
              cellProps.render
            )}
          </TableCell>
        );
      })}
  </TableRow>
);

export default memo(MuiTableRow, (prevProps, nextProps) => {
  if (!prevProps.getEqualityData || !nextProps.getEqualityData) return false;

  const prevEqualityData = prevProps.getEqualityData();
  const nextEqualityData = nextProps.getEqualityData();

  if (prevEqualityData === undefined || nextEqualityData === undefined)
    return false;

  return equal(prevEqualityData, nextEqualityData);
});
