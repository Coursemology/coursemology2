import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Alert, Divider, Typography } from '@mui/material';
import { ProgrammingAutoGradingData } from 'types/course/assessment/submission/answer/programming';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import OutputStream from './OutputStream';
import TestCaseComponent from './TestCaseComponent';

interface Props {
  autogradings: ProgrammingAutoGradingData[];
}

const translations = defineMessages({
  standardOutput: {
    id: 'course.assessment.submission.TestCaseView.standardOutput',
    defaultMessage: 'Standard Output',
  },
  standardError: {
    id: 'course.assessment.submission.TestCaseView.standardError',
    defaultMessage: 'Standard Error',
  },
  answerGradedOnPastSnapshot: {
    id: 'course.assessment.submission.history.answerGradedOnPastSnapshot',
    defaultMessage:
      'Changes have been made to the question after this autograding run.',
  },
  multipleAutoGradingResults: {
    id: 'course.assessment.submission.history.multipleAutoGradingResults',
    defaultMessage: 'This answer has been autograded {count} times.',
  },
  multipleAutoGradingVariedResults: {
    id: 'course.assessment.submission.history.multipleAutoGradingVariedResults',
    defaultMessage:
      'This answer has been autograded {count} times, some of which produced different results.',
  },
  autoGradingItemTitle: {
    id: 'course.assessment.statistics.autoGradingItemTitle',
    defaultMessage: 'Graded At: {gradedAt}',
  },
});

const AutoGradingItemComponent: FC<{ testCase: ProgrammingAutoGradingData }> = (
  props,
) => {
  const { testCase } = props;
  const { t } = useTranslation();
  return (
    <div className="my-5 space-y-5">
      {testCase.gradedOnPastSnapshot && (
        <Alert severity="warning">
          {t(translations.answerGradedOnPastSnapshot)}
        </Alert>
      )}
      {testCase.testCases?.public_test &&
        testCase.testCases.public_test.length > 0 && (
          <TestCaseComponent
            testCases={testCase.testCases.public_test}
            testCaseType="publicTestCases"
            testResults={testCase.testResults?.public_test}
          />
        )}

      {testCase.testCases?.private_test &&
        testCase.testCases.private_test.length > 0 && (
          <TestCaseComponent
            testCases={testCase.testCases.private_test}
            testCaseType="privateTestCases"
            testResults={testCase.testResults?.private_test}
          />
        )}

      {testCase.testCases?.evaluation_test &&
        testCase.testCases.evaluation_test.length > 0 && (
          <TestCaseComponent
            testCases={testCase.testCases.evaluation_test}
            testCaseType="evaluationTestCases"
            testResults={testCase.testResults?.evaluation_test}
          />
        )}

      <OutputStream
        output={testCase.stdout}
        outputStreamType="standardOutput"
        title={t(translations.standardOutput)}
      />

      <OutputStream
        output={testCase.stderr}
        outputStreamType="standardError"
        title={t(translations.standardError)}
      />
    </div>
  );
};

const AutoGradingComponent: FC<Props> = (props) => {
  const { autogradings } = props;
  const { t } = useTranslation();

  const autogradingResultCounts = autogradings.map((autograding) => ({
    public_test: {
      passed:
        autograding.testCases?.public_test?.filter(
          (test) => autograding.testResults?.public_test?.[test.id]?.passed,
        ).length ?? 0,
      total: autograding.testCases?.public_test?.length ?? 0,
    },
    private_test: {
      passed:
        autograding.testCases?.private_test?.filter(
          (test) => autograding.testResults?.private_test?.[test.id]?.passed,
        ).length ?? 0,
      total: autograding.testCases?.private_test?.length ?? 0,
    },
    evaluation_test: {
      passed:
        autograding.testCases?.evaluation_test?.filter(
          (test) => autograding.testResults?.evaluation_test?.[test.id]?.passed,
        ).length ?? 0,
      total: autograding.testCases?.evaluation_test?.length ?? 0,
    },
  }));

  const autogradingResultsAllIdentical = autogradingResultCounts.reduce(
    (acc, current) => {
      if (!acc) return false;
      const first = autogradingResultCounts[0];
      return (
        current.public_test.passed === first.public_test.passed &&
        current.private_test.passed === first.private_test.passed &&
        current.evaluation_test.passed === first.evaluation_test.passed
      );
    },
    true,
  );

  const [isShowingPastGradings, setIsShowingPastGradings] = useState(false);

  const TogglePastGradingLink = (): JSX.Element => (
    <Link
      onClick={() => {
        setIsShowingPastGradings(!isShowingPastGradings);
      }}
      underline="always"
    >
      {isShowingPastGradings ? 'Hide' : 'Show all'}
    </Link>
  );

  return (
    <div className="my-5 pt-5 space-y-5">
      {autogradings.length > 1 && autogradingResultsAllIdentical && (
        <Alert severity="info">
          {t(translations.multipleAutoGradingResults, {
            count: autogradings.length,
          })}
          &nbsp;
          <TogglePastGradingLink />
        </Alert>
      )}

      {autogradings.length > 1 && !autogradingResultsAllIdentical && (
        <Alert severity="warning">
          {t(translations.multipleAutoGradingVariedResults, {
            count: autogradings.length,
          })}
          &nbsp;
          <TogglePastGradingLink />
        </Alert>
      )}

      {isShowingPastGradings &&
        autogradings.toReversed().map((autograding) => (
          <>
            <Typography variant="subtitle2">
              {t(translations.autoGradingItemTitle, {
                gradedAt: formatLongDateTime(autograding.createdAt),
              })}
            </Typography>
            <AutoGradingItemComponent
              key={`autograding_${autograding.id}`}
              testCase={autograding}
            />
            <Divider className="border-neutral-300 last:border-none" />
          </>
        ))}
      {!isShowingPastGradings && (
        <AutoGradingItemComponent
          testCase={autogradings[autogradings.length - 1]}
        />
      )}
    </div>
  );
};

export default AutoGradingComponent;
