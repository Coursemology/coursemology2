import { Children, ReactNode } from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';

interface TestCaseRowProps {
  children: ReactNode;
  header?: string;
}

const TestCaseRow = ({ children, header }: TestCaseRowProps): JSX.Element => (
  <>
    <TableRow>
      <TableCell
        className={`h-fit border-none pb-0 pl-4 pt-1 leading-none ${
          !header ? 'pb-1' : ''
        }`}
        colSpan={Children.count(children)}
      >
        {header && (
          <Typography
            className="min-h-[2rem] break-all"
            color="text.secondary"
            variant="caption"
          >
            {header}
          </Typography>
        )}
      </TableCell>
    </TableRow>

    <TableRow>{children}</TableRow>
  </>
);

export default TestCaseRow;
