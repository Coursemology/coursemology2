import { Paper, Table, TableContainer } from '@mui/material';

import TableProps from '../adapters/Table';

import { gridSx } from './gridSxStyles';
import MuiTableBody from './MuiTableBody';
import MuiTableHeader from './MuiTableHeader';
import MuiTablePagination from './MuiTablePagination';
import MuiTableToolbar from './MuiTableToolbar';

const MuiTable = <H, B, C>(props: TableProps<H, B, C>): JSX.Element => {
  const hasGroupedHeaders =
    (props.header?.rows.length ?? 0) > 1;
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
        sx={
          isScrollContained
            ? { maxHeight: props.maxHeight, overflow: 'auto' }
            : undefined
        }
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
      >
        <Table
          size="small"
          stickyHeader={stickyHeader}
          className={
            hasGroupedHeaders || hasPinnedColumns
              ? '!border-separate'
              : undefined
          }
          sx={sx}
        >
          {props.header && <MuiTableHeader rows={props.header.rows} />}

          <MuiTableBody {...props.body} hasPinnedColumns={hasPinnedColumns} />
        </Table>
      </TableContainer>

      {props.pagination && <MuiTablePagination {...props.pagination} />}
    </Paper>
  );
};

export default MuiTable;
