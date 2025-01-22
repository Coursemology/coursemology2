import { ReactNode } from 'react';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';
import TableContainer from 'lib/components/core/layouts/TableContainer';

export interface StaticTestCasesTableProps {
  title: string;
  disabled?: boolean;
  subtitle?: string;
  lhsHeader: string;
  rhsHeader: string;
  hintHeader: string;
}

const StaticTestCasesTable = (
  props: StaticTestCasesTableProps & { children: ReactNode },
): JSX.Element => {
  return (
    <Accordion
      defaultExpanded
      disabled={props.disabled}
      subtitle={props.subtitle}
      title={props.title}
    >
      <TableContainer dense stickyHeader variant="bare">
        <TableHead className="sticky top-0 z-10 bg-white">
          <TableRow>
            <TableCell className="border-b border-solid border-b-neutral-200 py-0 pl-4 pr-0">
              {props.lhsHeader}
            </TableCell>

            <TableCell className="border-b border-solid border-b-neutral-200 px-2 py-0">
              {props.rhsHeader}
            </TableCell>

            <TableCell className="border-b border-solid border-b-neutral-200 px-0 py-0">
              {props.hintHeader}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>{props.children}</TableBody>
      </TableContainer>
    </Accordion>
  );
};

export default StaticTestCasesTable;
