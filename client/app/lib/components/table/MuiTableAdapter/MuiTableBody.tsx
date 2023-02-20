import { TableBody, TableCell, TableRow } from '@mui/material';

import { BodyProps, isRowSelector } from '../adapters';

import MuiTableRowSelector from './MuiTableRowSelector';

const MuiTableBody = <B, C>(props: BodyProps<B, C>): JSX.Element => (
  <TableBody>
    {props.rows.map((row, index) => {
      const rowProps = props.forEachRow(row, index);

      return (
        <TableRow key={rowProps.id} className={rowProps.className}>
          {props.getCells(row).map((cell, cellIndex) => {
            const cellProps = props.forEachCell(cell, row, cellIndex);

            return (
              <TableCell key={cellProps.id}>
                {isRowSelector(cellProps.render) ? (
                  <MuiTableRowSelector {...cellProps.render} />
                ) : (
                  cellProps.render
                )}
              </TableCell>
            );
          })}
        </TableRow>
      );
    })}
  </TableBody>
);

export default MuiTableBody;
