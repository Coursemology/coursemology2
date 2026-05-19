import { memo } from 'react';
import { TableCell, TableRow } from '@mui/material';
import equal from 'fast-deep-equal';

import { isRowSelector } from '../adapters';
import { CellRender, RowRender } from '../adapters/Body';

import { computePinOffsets, pinCellSx } from './gridSxStyles';
import MuiTableRowSelector from './MuiTableRowSelector';

interface MuiTableRowProps<C> extends RowRender {
  getCells: () => C[];
  forEachCell: (cell: C, index: number) => CellRender;
  hasPinnedColumns?: boolean;
}

const MuiTableRow = <C,>(props: MuiTableRowProps<C>): JSX.Element => {
  const allCells = props
    .getCells()
    .map((cell, i) => props.forEachCell(cell, i));
  const visible = allCells.filter((c) => !c.shouldNotRender);

  const leftPinWidths = visible
    .filter((c) => c.pin === 'left')
    .map((c) => c.widthPx ?? 0);
  const rightPinWidths = visible
    .filter((c) => c.pin === 'right')
    .map((c) => c.widthPx ?? 0);
  const leftOffsets = computePinOffsets(leftPinWidths, 'left');
  const rightOffsets = computePinOffsets(rightPinWidths, 'right');

  let leftPinCount = 0;
  let rightPinCount = 0;

  return (
    <TableRow className={props.className}>
      {visible.map((cellProps) => {
        let pinSx;
        let pinOffsetAttr: number | undefined;

        if (cellProps.pin === 'left') {
          const offset = leftOffsets[leftPinCount];
          pinOffsetAttr = offset;
          pinSx = pinCellSx({
            side: 'left',
            offsetPx: offset,
            widthPx: cellProps.widthPx!,
            isHeader: false,
          });
          leftPinCount += 1;
        } else if (cellProps.pin === 'right') {
          const offset = rightOffsets[rightPinCount];
          pinOffsetAttr = offset;
          pinSx = pinCellSx({
            side: 'right',
            offsetPx: offset,
            widthPx: cellProps.widthPx!,
            isHeader: false,
          });
          rightPinCount += 1;
        }

        return (
          <TableCell
            key={cellProps.id}
            className={cellProps.className}
            colSpan={cellProps.colSpan}
            data-table-pin={cellProps.pin ?? undefined}
            data-table-pin-offset-px={pinOffsetAttr}
            sx={pinSx}
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
};

export default memo(MuiTableRow, (prevProps, nextProps) => {
  if (!prevProps.getEqualityData || !nextProps.getEqualityData) return false;

  const prevEqualityData = prevProps.getEqualityData();
  const nextEqualityData = nextProps.getEqualityData();

  if (prevEqualityData === undefined || nextEqualityData === undefined)
    return false;

  return equal(prevEqualityData, nextEqualityData);
}) as typeof MuiTableRow;
