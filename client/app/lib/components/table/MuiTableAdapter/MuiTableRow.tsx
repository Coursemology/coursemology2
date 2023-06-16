import { memo } from 'react';
import { TableCell, TableRow } from '@mui/material';
import equal from 'fast-deep-equal';

import { isRowSelector } from '../adapters';
import { CellRender, RowRender } from '../adapters/Body';

import MuiTableRowSelector from './MuiTableRowSelector';

interface MuiTableRowProps<C> extends RowRender {
  getCells: () => C[];
  forEachCell: (cell: C, index: number) => CellRender;
}

const MuiTableRow = <C,>(props: MuiTableRowProps<C>): JSX.Element => (
  <TableRow className={props.className}>
    {props.getCells().map((cell, cellIndex) => {
      const cellProps = props.forEachCell(cell, cellIndex);

      return (
        <TableCell key={cellProps.id} className={cellProps.className}>
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
