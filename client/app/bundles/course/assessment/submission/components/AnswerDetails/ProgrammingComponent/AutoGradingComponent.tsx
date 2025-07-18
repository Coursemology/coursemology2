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

interface TestCaseResultCounts {
  passed: number;
  total: number;
}

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
      {testCase.public_test && testCase.public_test.length > 0 && (
        <TestCaseComponent
          testCaseResults={testCase.public_test}
          testCaseType="publicTestCases"
        />
      )}

      {testCase.private_test && testCase.private_test.length > 0 && (
        <TestCaseComponent
          testCaseResults={testCase.private_test}
          testCaseType="privateTestCases"
        />
      )}

      {testCase.evaluation_test && testCase.evaluation_test.length > 0 && (
        <TestCaseComponent
          testCaseResults={testCase.evaluation_test}
          testCaseType="evaluationTestCases"
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
        autograding.public_test?.filter((test) => test.passed).length ?? 0,
      total: autograding.public_test?.length ?? 0,
    },
    private_test: {
      passed:
        autograding.private_test?.filter((test) => test.passed).length ?? 0,
      total: autograding.private_test?.length ?? 0,
    },
    evaluation_test: {
      passed:
        autograding.evaluation_test?.filter((test) => test.passed).length ?? 0,
      total: autograding.evaluation_test?.length ?? 0,
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
        <Alert severity="warning">
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
