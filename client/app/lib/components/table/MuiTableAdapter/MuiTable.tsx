import { Paper, Table, TableContainer } from '@mui/material';

import TableProps from '../adapters/Table';

import { gridSx } from './gridSxStyles';
import MuiTableBody from './MuiTableBody';
import MuiTableHeader from './MuiTableHeader';
import MuiTablePagination from './MuiTablePagination';
import MuiTableToolbar from './MuiTableToolbar';

const MuiTable = <B, C>(props: TableProps<B, C>): JSX.Element => {
  // A flat table produces exactly 1 header row (the leaf row). More than 1
  // means at least one group row exists above it.
  const hasGroupedHeaders = (props.header?.rows.length ?? 0) > 1;
  // Pinned cells only appear in row 0 but checking all rows is harmless.
  const hasPinnedColumns =
    props.header?.rows.some((r) => r.cells.some((c) => c.pin)) ?? false;
  const isScrollContained = props.maxHeight !== undefined;
  const stickyHeader = hasGroupedHeaders || isScrollContained;

  const sx =
    hasGroupedHeaders || hasPinnedColumns
      ? gridSx({ hasGroupedHeaders, hasPinnedColumns })
      : undefined;

  return (
    <Paper className={props.className} variant="outlined">
      <MuiTableToolbar {...props.toolbar} />

      <TableContainer
        style={
          isScrollContained
            ? {
                maxHeight:
                  typeof props.maxHeight === 'number'
                    ? `${props.maxHeight}px`
                    : props.maxHeight,
              }
            : undefined
        }
        sx={isScrollContained ? { overflow: 'auto' } : undefined}
      >
        <Table
          className={
            // MUI applies border-collapse: collapse by default, which ignores
            // borderSpacing. gridSx relies on borderSpacing: 0 to flush cell
            // gaps, so override to border-separate with !important via
            // Tailwind's !border-separate. Only applied when gridSx is active.
            hasGroupedHeaders || hasPinnedColumns
              ? '!border-separate'
              : undefined
          }
          size="small"
          stickyHeader={stickyHeader}
          sx={sx}
        >
          {props.header && <MuiTableHeader rows={props.header.rows} />}

          <MuiTableBody {...props.body} />
        </Table>
      </TableContainer>

      {props.pagination && <MuiTablePagination {...props.pagination} />}
    </Paper>
  );
};

export default MuiTable;
