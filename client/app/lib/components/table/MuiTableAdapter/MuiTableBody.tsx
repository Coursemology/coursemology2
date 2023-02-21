import { TableBody } from '@mui/material';

import { BodyProps } from '../adapters';
import { CellRender } from '../adapters/Body';

import MuiTableRow from './MuiTableRow';

const MuiTableBody = <B, C>(props: BodyProps<B, C>): JSX.Element => (
  <TableBody>
    {props.rows.map((row, index) => {
      const rowProps = props.forEachRow(row, index);

      return (
        <MuiTableRow
          key={rowProps.id}
          className={rowProps.className}
          forEachCell={(cell, cellIndex): CellRender =>
            props.forEachCell(cell as C, row, cellIndex)
          }
          getCells={(): C[] => props.getCells(row)}
          getEqualityData={rowProps.getEqualityData}
          id={rowProps.id}
        />
      );
    })}
  </TableBody>
);

export default MuiTableBody;
