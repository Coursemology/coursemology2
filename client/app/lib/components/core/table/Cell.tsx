import { TableCell as MuiTableCell } from '@mui/material';

import { Alignment, CellData, isCustomCell } from './template';

interface CellProps {
  cell: CellData;
  align?: Alignment;
  className?: string;
  header?: boolean;
}

const Cell = (props: CellProps): JSX.Element => {
  const { cell, align, className, header } = props;

  if (isCustomCell(cell))
    return (
      <MuiTableCell
        align={align}
        className={`${className ?? ''} ${cell.className ?? ''}`}
        variant={header ? 'head' : 'body'}
      >
        {cell.render}
      </MuiTableCell>
    );

  return (
    <MuiTableCell
      align={align}
      className={className ?? ''}
      variant={header ? 'head' : 'body'}
    >
      {cell}
    </MuiTableCell>
  );
};

export default Cell;
