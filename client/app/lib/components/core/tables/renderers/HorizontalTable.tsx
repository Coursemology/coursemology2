import { ComponentProps } from 'react';
import {
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
} from '@mui/material';

import Cell from '../Cell';
import { TableRenderer } from '../types';

const HorizontalTable = (props: ComponentProps<TableRenderer>): JSX.Element => {
  const { headerCells, bodyCells } = props;

  return (
    <MuiTableBody>
      {headerCells.map((headerCell, index) => (
        <MuiTableRow>
          <Cell with={headerCell} />

          {bodyCells.map((rowCells) => (
            <Cell with={rowCells[index]} />
          ))}
        </MuiTableRow>
      ))}
    </MuiTableBody>
  );
};

export default HorizontalTable;
