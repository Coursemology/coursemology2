/* eslint-disable react/prop-types */
import {
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
} from '@mui/material';

import Cell from './Cell';
import TableContainer from './TableContainer';
import { AnyTable } from './template';

/**
 * @deprecated Use `lib/components/table` instead.
 */
const HorizontalTable: AnyTable = (props) => {
  const { children: columns, data, rowKey } = props;

  const rows = columns.reduce<JSX.Element[]>((array, column) => {
    if (column.hideColumnWhen) return array;

    const header = (
      <Cell
        align={column.align}
        cell={column.header}
        className={column.className}
        header
      />
    );

    const cells = data.map((rowData) => (
      <Cell
        key={rowKey(rowData)}
        align={column.align}
        cell={column.content(rowData)}
        className={column.className}
      />
    ));

    array.push(
      <MuiTableRow>
        {header}
        {cells}
      </MuiTableRow>,
    );

    return array;
  }, []);

  return (
    <TableContainer {...props}>
      <MuiTableBody>{rows}</MuiTableBody>
    </TableContainer>
  );
};

export default HorizontalTable;
