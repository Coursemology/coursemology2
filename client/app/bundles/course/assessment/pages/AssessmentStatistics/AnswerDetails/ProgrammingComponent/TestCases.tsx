import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Done } from '@mui/icons-material';
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { TestCaseResult } from 'types/course/assessment/submission/answer/programming';
import { TestCase } from 'types/course/statistics/answer';

import Accordion from 'lib/components/core/layouts/Accordion';
import useTranslation from 'lib/hooks/useTranslation';

import TestCaseRow from './TestCaseRow';

const translations = defineMessages({
  expression: {
    id: 'course.assessment.submission.TestCaseView.experession',
    defaultMessage: 'Expression',
  },
  expected: {
    id: 'course.assessment.submission.TestCaseView.expected',
    defaultMessage: 'Expected',
  },
  output: {
    id: 'course.assessment.submission.TestCaseView.output',
    defaultMessage: 'Output',
  },
  allPassed: {
    id: 'course.assessment.submission.TestCaseView.allPassed',
    defaultMessage: 'All passed',
  },
  publicTestCases: {
    id: 'course.assessment.submission.TestCaseView.publicTestCases',
    defaultMessage: 'Public Test Cases',
  },
  privateTestCases: {
    id: 'course.assessment.submission.TestCaseView.privateTestCases',
    defaultMessage: 'Private Test Cases',
  },
  evaluationTestCases: {
    id: 'course.assessment.submission.TestCaseView.evaluationTestCases',
    defaultMessage: 'Evaluation Test Cases',
  },
  standardOutput: {
    id: 'course.assessment.submission.TestCaseView.standardOutput',
    defaultMessage: 'Standard Output',
  },
  standardError: {
    id: 'course.assessment.submission.TestCaseView.standardError',
    defaultMessage: 'Standard Error',
  },
  noOutputs: {
    id: 'course.assessment.submission.TestCaseView.noOutputs',
    defaultMessage: 'No outputs',
  },
});

interface Props {
  testCase: TestCase;
}

const TestCaseComponent = (
  testCaseResults: TestCaseResult[],
  testCaseType: string,
): JSX.Element => {
  const { t } = useTranslation();
  const passedTestCases = testCaseResults.reduce(
    (passed, testCase) => passed && testCase?.passed,
    true,
  );

  return (
    <Accordion
      className={passedTestCases ? 'border-success' : ''}
      defaultExpanded={false}
      disableGutters
      icon={
        passedTestCases && (
          <Chip
            color="success"
            icon={<Done />}
            label={t(translations.allPassed)}
            size="small"
            variant="outlined"
          />
        )
      }
      id={testCaseType}
      title={t(translations[testCaseType])}
    >
      <Table className="table-fixed">
        <TableHead>
          <TableRow>
            <TableCell className="w-full">
              <FormattedMessage {...translations.expression} />
            </TableCell>

            <TableCell className="w-full">
              <FormattedMessage {...translations.expected} />
            </TableCell>

            <TableCell className="w-full">
              <FormattedMessage {...translations.output} />
            </TableCell>

            <TableCell className="w-24" />
          </TableRow>
        </TableHead>

        <TableBody>
          {testCaseResults.map((result) => (
            <TestCaseRow key={result.identifier} result={result} />
          ))}
        </TableBody>
      </Table>
    </Accordion>
  );
};

const OutputStream = (
  outputStreamType: 'standardOutput' | 'standardError',
  output?: string,
): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Accordion
      defaultExpanded={false}
      disabled={!output}
      disableGutters
      icon={
        !output && (
          <Chip
            label={<FormattedMessage {...translations.noOutputs} />}
            size="small"
            variant="outlined"
          />
        )
      }
      id={outputStreamType}
      title={t(translations[outputStreamType])}
    >
      <pre className="w-full">{output}</pre>
    </Accordion>
  );
};

const TestCases: FC<Props> = (props) => {
  const { testCase } = props;

  return (
    <div className="my-5 space-y-5">
      {testCase.public_test &&
        testCase.public_test.length > 0 &&
        TestCaseComponent(testCase.public_test, 'publicTestCases')}

      {testCase.private_test &&
        testCase.private_test.length > 0 &&
        TestCaseComponent(testCase.private_test, 'privateTestCases')}

      {testCase.evaluation_test &&
        testCase.evaluation_test.length > 0 &&
        TestCaseComponent(testCase.evaluation_test, 'evaluationTestCases')}

      {OutputStream('standardOutput', testCase.stdout)}
      {OutputStream('standardError', testCase.stderr)}
    </div>
  );
};

export default TestCases;
