import { useMemo } from 'react';
import {
  Paper as MuiPaper,
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
} from '@mui/material';

import Cell from './Cell';
import Row from './Row';
import { AnyRowData, ColumnTemplate } from './template';

type Variants = 'outlined' | 'elevation';

interface TableProps<RowData extends AnyRowData> {
  data: RowData[];
  children: ColumnTemplate<RowData>[];
  rowKey: (row: RowData) => string;
  rowClassName?: string | ((row: RowData) => string);
  headerClassName?: string;
  className?: string;
  variant?: Variants;
  stickyHeader?: boolean;
}

const Table = <RowData extends AnyRowData>(
  props: TableProps<RowData>,
): JSX.Element => {
  const { children: columns, data, rowKey, rowClassName, variant } = props;

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
    <TableContainer
      className={`${props.stickyHeader ? 'overflow-x-clip' : ''} ${
        props.className ?? ''
      }`}
      component={MuiPaper}
      variant={variant}
    >
      <MuiTable>
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
      </MuiTable>
    </TableContainer>
  );
};

export default Table;
