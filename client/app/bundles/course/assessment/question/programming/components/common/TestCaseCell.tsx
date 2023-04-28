import { ReactNode } from 'react';
import { TableCell } from '@mui/material';

interface TestCaseCellProps {
  children: ReactNode;
  className?: string;
}

const LeadingCell = (props: TestCaseCellProps): JSX.Element => (
  <TableCell className={`pb-2 pl-4 pr-0 pt-0 ${props.className ?? ''}`}>
    {props.children}
  </TableCell>
);

const MiddleCell = (props: TestCaseCellProps): JSX.Element => (
  <TableCell className={`px-2 pb-2 pt-0 ${props.className ?? ''}`}>
    {props.children}
  </TableCell>
);

const TrailingCell = (props: TestCaseCellProps): JSX.Element => (
  <TableCell className={`px-0 pb-2 pt-0 ${props.className ?? ''}`}>
    {props.children}
  </TableCell>
);

const ActionCell = (props: TestCaseCellProps): JSX.Element => (
  <TableCell className={`pb-2 pl-0 pt-0 ${props.className ?? ''}`}>
    {props.children}
  </TableCell>
);

const TestCaseCell = {
  Expression: LeadingCell,
  Expected: MiddleCell,
  Hint: TrailingCell,
  Actions: ActionCell,
};

export default TestCaseCell;
