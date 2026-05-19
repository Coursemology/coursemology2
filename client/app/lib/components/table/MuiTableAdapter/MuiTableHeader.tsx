import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';

import { isRowSelector } from '../adapters';
import { HeaderRender } from '../adapters/Header';
import { HeaderCell, HeaderRow } from '../builder/buildHeaderRows';

import { computePinOffsets, pinCellSx } from './gridSxStyles';
import MuiFilterMenu from './MuiFilterMenu';
import MuiTableRowSelector from './MuiTableRowSelector';
import { useStickyHeaderOffsets } from './useStickyHeaderOffsets';

interface MuiTableHeaderProps {
  rows: HeaderRow<HeaderRender>[];
}

const renderLeafContent = (leaf: HeaderRender): JSX.Element => (
  <>
    {leaf.sorting ? (
      <TableSortLabel
        active={leaf.sorting.sorted}
        direction={leaf.sorting.direction}
        onClick={leaf.sorting.onClickSort}
      >
        {isRowSelector(leaf.render) ? (
          <MuiTableRowSelector {...leaf.render} />
        ) : (
          leaf.render
        )}
      </TableSortLabel>
    ) : isRowSelector(leaf.render) ? (
      <MuiTableRowSelector {...leaf.render} />
    ) : (
      leaf.render
    )}
    {leaf.filtering && <MuiFilterMenu {...leaf.filtering} />}
  </>
);

const MuiTableHeader = (props: MuiTableHeaderProps): JSX.Element => {
  const { rows } = props;
  const { rowRefs, rowTops } = useStickyHeaderOffsets(rows.length, [
    rows.length,
  ]);

  const leftPins = rows[0]?.cells.filter((c) => c.pin === 'left') ?? [];
  const rightPins = rows[0]?.cells.filter((c) => c.pin === 'right') ?? [];

  const leftOffsets = computePinOffsets(
    leftPins.map((c) => c.widthPx ?? 0),
    'left',
  );
  const rightOffsets = computePinOffsets(
    rightPins.map((c) => c.widthPx ?? 0),
    'right',
  );

  const getPinOffset = (
    cell: HeaderCell<HeaderRender>,
  ): number | undefined => {
    if (!cell.pin) return undefined;
    if (cell.pin === 'left') {
      const idx = leftPins.findIndex((c) => c.key === cell.key);
      return idx >= 0 ? leftOffsets[idx] : undefined;
    }
    const idx = rightPins.findIndex((c) => c.key === cell.key);
    return idx >= 0 ? rightOffsets[idx] : undefined;
  };

  const isGrouped = rows.length > 1;

  return (
    <TableHead>
      {rows.map((row, rowIndex) => (
        <TableRow
          key={rowIndex}
          ref={rowRefs[rowIndex]}
          sx={
            rowIndex > 0
              ? {
                  '& .MuiTableCell-stickyHeader': { top: rowTops[rowIndex] },
                }
              : undefined
          }
        >
          {row.cells.map((cell) => {
            const offset = getPinOffset(cell);
            const isPinned = cell.pin != null && offset != null;
            const isPinnedWithRowSpan = isPinned && isGrouped && cell.rowSpan > 1;

            return (
              <TableCell
                key={cell.key}
                className={[
                  cell.className ?? '',
                  isPinnedWithRowSpan ? 'grid-pin-rowspan' : '',
                ]
                  .filter(Boolean)
                  .join(' ') || undefined}
                colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                sx={
                  isPinned
                    ? pinCellSx({
                        side: cell.pin!,
                        offsetPx: offset!,
                        widthPx: cell.widthPx!,
                        isHeader: true,
                      })
                    : undefined
                }
                data-table-pin={cell.pin ?? undefined}
                data-table-pin-offset-px={isPinned ? offset : undefined}
                data-table-cell-kind={cell.leaf ? 'leaf' : 'group'}
              >
                {cell.leaf ? renderLeafContent(cell.leaf) : cell.render}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableHead>
  );
};

export default MuiTableHeader;
