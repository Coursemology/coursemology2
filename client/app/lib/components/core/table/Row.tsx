import { memo } from 'react';
import { TableRow as MuiTableRow } from '@mui/material';
import equal from 'fast-deep-equal';

import Cell from './Cell';
import { AnyRowData, ColumnTemplate } from './template';

interface BaseRowProps<RowData extends AnyRowData> {
  rowData: RowData;
  columns: ColumnTemplate<RowData>[];
  className?: string;
}

const BaseRow = <RowData extends AnyRowData>(
  props: BaseRowProps<RowData>,
): JSX.Element => {
  const { rowData, columns, className } = props;

  return (
    <MuiTableRow className={className ?? ''}>
      {columns.reduce<JSX.Element[]>((cells, column, index) => {
        if (column.hideColumnWhen) return cells;

        cells.push(
          <Cell
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            align={column.align}
            cell={column.content(rowData)}
            className={column.className}
          />,
        );

        return cells;
      }, [])}
    </MuiTableRow>
  );
};

const Row = memo(BaseRow, equal) as typeof BaseRow;

export default Row;
