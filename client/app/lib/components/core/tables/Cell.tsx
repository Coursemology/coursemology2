import { TableCell as MuiTableCell } from '@mui/material';

import { CellTemplate } from './types';

interface CellProps {
  with: CellTemplate;
}

const Cell = (props: CellProps): JSX.Element => {
  const { with: cell } = props;

  return (
    <MuiTableCell align={cell.align} className={cell.className}>
      {cell.content}
    </MuiTableCell>
  );
};

export default Cell;
