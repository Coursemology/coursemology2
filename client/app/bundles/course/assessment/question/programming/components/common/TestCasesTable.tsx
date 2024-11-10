import { ReactNode } from 'react';
import { Add } from '@mui/icons-material';
import {
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';
import TableContainer from 'lib/components/core/layouts/TableContainer';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

export interface TestCasesTableProps {
  title: string;
  onClickAdd?: () => void;
  disabled?: boolean;
  subtitle?: string;
  lhsHeader: string;
  rhsHeader: string;
  hintHeader: string;
}

const TestCasesTable = (
  props: TestCasesTableProps & { children: ReactNode },
): JSX.Element => {
  const { t } = useTranslation();

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

            {props.onClickAdd && (
              <TableCell className="border-b border-solid border-b-neutral-200 py-0 pl-0">
                <Tooltip disableInteractive title={t(translations.addTestCase)}>
                  <IconButton
                    color="primary"
                    disabled={props.disabled}
                    edge="end"
                    onClick={props.onClickAdd}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>{props.children}</TableBody>
      </TableContainer>
    </Accordion>
  );
};

export default TestCasesTable;
