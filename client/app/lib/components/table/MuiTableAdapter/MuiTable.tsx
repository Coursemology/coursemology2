import { Paper, Table, TableContainer } from '@mui/material';

import TableProps from '../adapters/Table';

import MuiTableBody from './MuiTableBody';
import MuiTableHeader from './MuiTableHeader';
import MuiTablePagination from './MuiTablePagination';
import MuiTableToolbar from './MuiTableToolbar';

const MuiTable = <H, B, C>(props: TableProps<H, B, C>): JSX.Element => {
  return (
    <Paper className={props.className} variant="outlined">
      <MuiTableToolbar {...props.toolbar} />

      <TableContainer>
        <Table size="small">
          {props.header && <MuiTableHeader {...props.header} />}

          <MuiTableBody {...props.body} />
        </Table>
      </TableContainer>

      {props.pagination && <MuiTablePagination {...props.pagination} />}
    </Paper>
  );
};

export default MuiTable;
