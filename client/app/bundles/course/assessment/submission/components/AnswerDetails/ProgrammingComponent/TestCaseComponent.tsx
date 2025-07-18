import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Close, Done } from '@mui/icons-material';
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { TestCaseResult } from 'types/course/assessment/submission/answer/programming';

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
  allFailed: {
    id: 'course.assessment.submission.TestCaseView.allFailed',
    defaultMessage: 'All failed',
  },
  testCasesPassed: {
    id: 'course.assessment.submission.TestCaseView.testCasesPassed',
    defaultMessage: '{numPassed}/{numTestCases} passed',
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
});

interface TestCaseComponentProps {
  testCaseResults: TestCaseResult[];
  testCaseType: string;
}

const TestCaseComponent: FC<TestCaseComponentProps> = (props) => {
  const { testCaseResults, testCaseType } = props;
  const { t } = useTranslation();

  const isProgrammingAnswerEvaluated =
    testCaseResults.filter((result) => !!result.output).length > 0;

  const numPassedTestCases = testCaseResults.filter(
    (result) => result.passed,
  ).length;
  const numTestCases = testCaseResults.length;

  const AllTestCasesPassedChip: FC = () => (
    <Chip
      color="success"
      icon={<Done />}
      label={t(translations.allPassed)}
      size="small"
      variant="outlined"
    />
  );

  const SomeTestCasesPassedChip: FC = () => (
    <Chip
      color="warning"
      label={t(translations.testCasesPassed, {
        numPassed: numPassedTestCases,
        numTestCases,
      })}
      size="small"
      variant="outlined"
    />
  );

  const NoTestCasesPassedChip: FC = () => (
    <Chip
      color="error"
      icon={<Close />}
      label={t(translations.allFailed)}
      size="small"
      variant="outlined"
    />
  );

  const TestCasesIndicatorChip: FC = () => {
    if (!isProgrammingAnswerEvaluated) {
      return <div />;
    }

    if (numPassedTestCases === numTestCases) {
      return <AllTestCasesPassedChip />;
    }

    if (numPassedTestCases > 0) {
      return <SomeTestCasesPassedChip />;
    }

    return <NoTestCasesPassedChip />;
  };

  const testCaseComponentClassName = (): string => {
    if (!isProgrammingAnswerEvaluated) {
      return '';
    }

    if (numPassedTestCases === numTestCases) {
      return 'border-success';
    }

    if (numPassedTestCases > 0) {
      return 'border-warning';
    }

    return 'border-error';
  };

  return (
    <Accordion
      className={testCaseComponentClassName()}
      defaultExpanded={false}
      disableGutters
      icon={<TestCasesIndicatorChip />}
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

export default TestCaseComponent;
