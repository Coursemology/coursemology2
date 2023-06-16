import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';

import { HeaderProps, isRowSelector } from '../adapters';

import MuiFilterMenu from './MuiFilterMenu';
import MuiTableRowSelector from './MuiTableRowSelector';

const MuiTableHeader = <H,>(props: HeaderProps<H>): JSX.Element => (
  <TableHead>
    <TableRow>
      {props.headers.map((header, index) => {
        const headerProps = props.forEach(header, index);

        return (
          <TableCell
            key={headerProps.id}
            className={`whitespace-nowrap ${headerProps.className ?? ''}`}
          >
            {isRowSelector(headerProps.render) ? (
              <MuiTableRowSelector {...headerProps.render} />
            ) : (
              <>
                {headerProps.sorting && (
                  <TableSortLabel
                    active={headerProps.sorting.sorted}
                    direction={headerProps.sorting.direction}
                    onClick={headerProps.sorting.onClickSort}
                  >
                    {headerProps.render}
                  </TableSortLabel>
                )}

                {!headerProps.sorting && headerProps.render}
              </>
            )}

            {headerProps.filtering && (
              <MuiFilterMenu {...headerProps.filtering} />
            )}
          </TableCell>
        );
      })}
    </TableRow>
  </TableHead>
);

export default MuiTableHeader;
