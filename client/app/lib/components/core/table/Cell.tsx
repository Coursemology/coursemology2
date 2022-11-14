import { TableCell as MuiTableCell } from '@mui/material';

import { Alignment, CellData, isCustomCell } from './template';

interface CellProps {
  cell: CellData;
  align?: Alignment;
  className?: string;
}

const Cell = (props: CellProps): JSX.Element => {
  const { cell, align, className } = props;

  if (isCustomCell(cell))
    return (
      <MuiTableCell
        align={align}
        className={`${className ?? ''} ${cell.className ?? ''}`}
      >
        {cell.render}
      </MuiTableCell>
    );

  return (
    <MuiTableCell align={align} className={className ?? ''}>
      {cell}
    </MuiTableCell>
  );
};

export default Cell;
