import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';

import { isRowSelector } from '../adapters';
import type HeaderProps from '../adapters/Header';

import { computePinOffsets, pinCellSx } from './gridSxStyles';
import MuiFilterMenu from './MuiFilterMenu';
import MuiTableRowSelector from './MuiTableRowSelector';
import { useStickyHeaderOffsets } from './useStickyHeaderOffsets';

type MuiTableHeaderProps = HeaderProps;
type HeaderCell = MuiTableHeaderProps['rows'][number]['cells'][number];
type HeaderLeaf = NonNullable<HeaderCell['leaf']>;

const renderLeafContent = (leaf: HeaderLeaf): JSX.Element => {
  if (isRowSelector(leaf.render)) {
    return (
      <>
        <MuiTableRowSelector {...leaf.render} />
        {leaf.filtering && <MuiFilterMenu {...leaf.filtering} />}
      </>
    );
  }

  return (
    <>
      {leaf.sorting ? (
        <TableSortLabel
          active={leaf.sorting.sorted}
          direction={leaf.sorting.direction}
          onClick={leaf.sorting.onClickSort}
        >
          {leaf.render}
        </TableSortLabel>
      ) : (
        leaf.render
      )}
      {leaf.filtering && <MuiFilterMenu {...leaf.filtering} />}
    </>
  );
};

const MuiTableHeader = (props: MuiTableHeaderProps): JSX.Element => {
  const { rows } = props;
  const { rowRefs, rowTops } = useStickyHeaderOffsets(rows.length);

  // Pinned header cells are emitted only in the first row; grouped pins use rowSpan.
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

  const leftOffsetMap = new Map(
    leftPins.map((c, i) => [c.key, leftOffsets[i]]),
  );
  const rightOffsetMap = new Map(
    rightPins.map((c, i) => [c.key, rightOffsets[i]]),
  );

  const getPinOffset = (cell: HeaderCell): number | undefined => {
    if (!cell.pin) return undefined;
    if (cell.pin === 'left') return leftOffsetMap.get(cell.key);
    return rightOffsetMap.get(cell.key);
  };

  const isGrouped = rows.length > 1;

  return (
    <TableHead>
      {rows.map((row, rowIndex) => (
        <TableRow
          key={row.rowKey}
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
            const isLeafCell = cell.leaf !== undefined;
            const offset = getPinOffset(cell);
            const pinConfig =
              cell.pin != null && offset != null && cell.widthPx != null
                ? { side: cell.pin, offsetPx: offset, widthPx: cell.widthPx }
                : undefined;
            const isPinnedWithRowSpan =
              pinConfig != null && isGrouped && cell.rowSpan > 1;

            return (
              <TableCell
                key={cell.key}
                className={[
                  'whitespace-nowrap',
                  cell.className ?? '',
                  isPinnedWithRowSpan ? 'grid-pin-rowspan' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                data-table-cell-kind={isLeafCell ? 'leaf' : 'group'}
                data-table-pin={cell.pin ?? undefined}
                data-table-pin-offset-px={pinConfig?.offsetPx}
                rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                sx={
                  pinConfig
                    ? pinCellSx({ ...pinConfig, isHeader: true })
                    : undefined
                }
              >
                {cell.leaf !== undefined
                  ? renderLeafContent(cell.leaf)
                  : cell.render}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableHead>
  );
};

export default MuiTableHeader;
