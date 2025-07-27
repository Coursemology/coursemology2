import { FC, Fragment } from 'react';
import { Clear, Done } from '@mui/icons-material';
import { TableCell, TableRow, Typography } from '@mui/material';
import {
  ProgrammingTestCaseData,
  ProgrammingTestResultData,
} from 'types/course/assessment/submission/answer/programming';

import ExpandableCode from 'lib/components/core/ExpandableCode';

interface Props {
  testCase: ProgrammingTestCaseData;
  testResult?: ProgrammingTestResultData;
}

const TestCaseClassName = {
  unattempted: '',
  correct: 'bg-green-50',
  wrong: 'bg-red-50',
};

const TestCaseRow: FC<Props> = (props) => {
  const { testCase, testResult } = props;

  const nameRegex = /\/?(\w+)$/;
  const idMatch = testCase.identifier?.match(nameRegex);
  const truncatedIdentifier = idMatch ? idMatch[1] : '';

  let testCaseResult = 'unattempted';
  let testCaseIcon;
  if (testResult?.passed !== undefined) {
    testCaseResult = testResult.passed ? 'correct' : 'wrong';
    testCaseIcon = testResult.passed ? (
      <Done color="success" />
    ) : (
      <Clear color="error" />
    );
  }

  return (
    <Fragment key={testCase.identifier}>
      <TableRow className={TestCaseClassName[testCaseResult]}>
        <TableCell className="h-fit border-none pb-0 leading-none" colSpan={5}>
          <Typography
            className="break-all"
            color="text.secondary"
            variant="caption"
          >
            {truncatedIdentifier}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow className={TestCaseClassName[testCaseResult]}>
        <TableCell className="w-full pt-1">
          <ExpandableCode>{testCase.expression}</ExpandableCode>
        </TableCell>

        <TableCell className="w-full pt-1">
          <ExpandableCode>{testCase.expected || ''}</ExpandableCode>
        </TableCell>

        <TableCell className="w-full pt-1">
          <ExpandableCode>{testResult?.output || ''}</ExpandableCode>
        </TableCell>

        <TableCell>{testCaseIcon}</TableCell>
      </TableRow>
    </Fragment>
  );
};

export default TestCaseRow;
