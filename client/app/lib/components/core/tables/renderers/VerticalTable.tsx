import { ComponentProps } from 'react';
import {
  TableBody as MuiTableBody,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
} from '@mui/material';

import Cell from '../Cell';
import { TableRenderer } from '../types';

const VerticalTable = (props: ComponentProps<TableRenderer>): JSX.Element => {
  const { headerCells, bodyCells } = props;

  return (
    <>
      <MuiTableHead>
        <MuiTableRow>
          {headerCells.map((template) => (
            <Cell with={template} />
          ))}
        </MuiTableRow>
      </MuiTableHead>

      <MuiTableBody>
        {bodyCells.map((templates) => (
          <MuiTableRow>
            {templates.map((template) => (
              <Cell with={template} />
            ))}
          </MuiTableRow>
        ))}
      </MuiTableBody>
    </>
  );
};

export default VerticalTable as TableRenderer;
