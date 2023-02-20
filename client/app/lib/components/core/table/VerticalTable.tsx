/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import {
  TableBody as MuiTableBody,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
} from '@mui/material';

import Cell from './Cell';
import Row from './Row';
import TableContainer from './TableContainer';
import { AnyTable } from './template';

/**
 * @deprecated Use `lib/components/table` instead.
 */
const VerticalTable: AnyTable = (props) => {
  const { children: columns, data, rowKey, rowClassName } = props;

  const headerCells = useMemo(
    () =>
      columns.reduce<JSX.Element[]>((cells, column, index) => {
        if (column.hideColumnWhen) return cells;

        cells.push(
          <Cell
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            align={column.align}
            cell={column.header}
            className={column.className}
            header
          />,
        );

        return cells;
      }, []),
    [columns],
  );

  const rows = useMemo(
    () =>
      data.map((rowData) => {
        const key = rowKey(rowData);
        const className =
          typeof rowClassName === 'string'
            ? rowClassName
            : rowClassName?.(rowData);

        return (
          <Row
            key={key}
            className={className}
            columns={columns}
            rowData={rowData}
          />
        );
      }),
    [data, columns],
  );

  return (
    <TableContainer {...props}>
      {headerCells && (
        <MuiTableHead
          className={`${props.stickyHeader ? 'sticky' : ''} ${
            props.headerClassName ?? ''
          }`}
        >
          <MuiTableRow>{headerCells}</MuiTableRow>
        </MuiTableHead>
      )}

      <MuiTableBody>{rows}</MuiTableBody>
    </TableContainer>
  );
};

export default VerticalTable;
