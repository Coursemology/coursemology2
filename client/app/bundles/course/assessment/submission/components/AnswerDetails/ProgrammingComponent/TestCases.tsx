import { FC, memo } from 'react';
import { Close, Done } from '@mui/icons-material';
import {
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TestCaseData,
  TestCaseResultData,
  TestCasesByType,
  TestCaseType,
  TestResultsByType,
} from 'types/course/assessment/submission/answer/programming';

import Accordion from 'lib/components/core/layouts/Accordion';
import useTranslation from 'lib/hooks/useTranslation';

import OutputStream from './OutputStream';
import TestCaseRow from './TestCaseRow';
import translations from './translations';

const PANEL_TITLES = {
  public_test: 'publicTestCases',
  private_test: 'privateTestCases',
  evaluation_test: 'evaluationTestCases',
} as const satisfies Record<TestCaseType, keyof typeof translations>;

interface TestCaseComponentProps {
  testCaseType: TestCaseType;
  testCases: TestCaseData[];
  /** Absent when the answer has not been graded. */
  testResults?: Record<number, TestCaseResultData>;
  canReadTests: boolean;
  showOutput: boolean;
  /** Renders the "only staff can see this" subtitle. */
  staffOnly: boolean;
  defaultExpanded: boolean;
}

const TestCaseComponent: FC<TestCaseComponentProps> = (props) => {
  const {
    testCaseType,
    testCases,
    testResults,
    canReadTests,
    showOutput,
    staffOnly,
    defaultExpanded,
  } = props;
  const { t } = useTranslation();

  // `testResults` is absent until the answer has been graded, and a test case added to the question
  // after the grading run has no entry in it.
  const isEvaluated = testCases.some(
    (testCase) => testResults?.[testCase.id]?.passed !== undefined,
  );
  const numPassedTestCases = testCases.filter(
    (testCase) => testResults?.[testCase.id]?.passed,
  ).length;

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
        numTestCases: testCases.length,
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
    if (!isEvaluated) {
      return <div />;
    }

    if (numPassedTestCases === testCases.length) {
      return <AllTestCasesPassedChip />;
    }

    if (numPassedTestCases > 0) {
      return <SomeTestCasesPassedChip />;
    }

    return <NoTestCasesPassedChip />;
  };

  const testCaseComponentClassName = (): string => {
    if (!isEvaluated) {
      return '';
    }

    if (numPassedTestCases === testCases.length) {
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
      defaultExpanded={defaultExpanded}
      disableGutters
      icon={<TestCasesIndicatorChip />}
      id={testCaseType}
      subtitle={staffOnly ? t(translations.staffOnlyTestCases) : undefined}
      title={t(translations[PANEL_TITLES[testCaseType]])}
    >
      <Table className="table-fixed">
        <TableHead>
          <TableRow>
            <TableCell className="w-full">
              {t(translations.expression)}
            </TableCell>

            <TableCell className="w-full">{t(translations.expected)}</TableCell>

            {showOutput && (
              <TableCell className="w-full">{t(translations.output)}</TableCell>
            )}

            <TableCell className="w-24" />
          </TableRow>
        </TableHead>

        <TableBody>
          {testCases.map((testCase) => (
            <TestCaseRow
              key={testCase.id}
              canReadTests={canReadTests}
              showOutput={showOutput}
              testCase={testCase}
              testResult={testResults?.[testCase.id]}
            />
          ))}
        </TableBody>
      </Table>
    </Accordion>
  );
};

export interface TestCasesProps {
  canReadTests: boolean;
  testCases: TestCasesByType;
  testResults?: TestResultsByType;
  stdout?: string;
  stderr?: string;

  /**
   * Whether staff-only panels and columns are shown. The submission edit page passes its
   * `graderView` flag so that "student view" previews what a student sees; contexts with no such
   * toggle leave this at its default and render whatever the server chose to send.
   */
  graderView?: boolean;
  /**
   * Course setting: students may see the outputs of public test cases. Omit it where the payload has
   * already been filtered for the viewer; the column is then shown only when a public result
   * actually carries an output, rather than as a column of blanks.
   */
  showPublicTestCasesOutput?: boolean;
  /** Course setting: students may see stdout/stderr. Omit it as above. */
  showStdoutAndStderr?: boolean;
  /** Assessment setting, already narrowed to "and the submission is published". */
  showPrivateTestToStudents?: boolean;
  showEvaluationTestToStudents?: boolean;

  isAutograding?: boolean;
  defaultExpanded?: boolean;
}

const TestCases: FC<TestCasesProps> = (props) => {
  const {
    canReadTests,
    testCases,
    testResults,
    stdout,
    stderr,
    graderView = true,
    showPublicTestCasesOutput,
    showStdoutAndStderr,
    showPrivateTestToStudents = true,
    showEvaluationTestToStudents = true,
    isAutograding = false,
    defaultExpanded = true,
  } = props;
  const { t } = useTranslation();

  const isStaffOnlyOutputsVisible = graderView && canReadTests;

  // A caller that omits these settings is relying on the server having already filtered the payload
  // for this viewer, so fall back to what the payload actually holds rather than to the permissive
  // setting: neither of these is gated on data being present the way the panels below are, so a `true`
  // default renders a column, or a pair of panels, that the server deliberately left empty.
  const isPublicOutputVisible =
    showPublicTestCasesOutput ??
    Object.values(testResults?.public_test ?? {}).some(
      (testResult) => testResult.output !== undefined,
    );
  const isOutputStreamVisible =
    showStdoutAndStderr ?? (stdout !== undefined || stderr !== undefined);

  const visibility: Record<
    TestCaseType,
    { visible: boolean; staffOnly: boolean; showOutput: boolean }
  > = {
    public_test: {
      visible: true,
      staffOnly: false,
      showOutput: isStaffOnlyOutputsVisible || isPublicOutputVisible,
    },
    private_test: {
      visible: isStaffOnlyOutputsVisible || showPrivateTestToStudents,
      staffOnly: !showPrivateTestToStudents,
      showOutput: isStaffOnlyOutputsVisible,
    },
    evaluation_test: {
      visible: isStaffOnlyOutputsVisible || showEvaluationTestToStudents,
      staffOnly: !showEvaluationTestToStudents,
      showOutput: isStaffOnlyOutputsVisible,
    },
  };

  const showOutputStreams = isStaffOnlyOutputsVisible || isOutputStreamVisible;

  return (
    <div className="my-5 space-y-5">
      {isAutograding && (
        <Alert severity="info">{t(translations.autogradeProgress)}</Alert>
      )}

      {(Object.keys(PANEL_TITLES) as TestCaseType[]).map((testCaseType) => {
        const testCasesOfType = testCases[testCaseType];
        if (!testCasesOfType?.length || !visibility[testCaseType].visible) {
          return null;
        }

        return (
          <TestCaseComponent
            key={testCaseType}
            canReadTests={canReadTests}
            defaultExpanded={defaultExpanded}
            showOutput={visibility[testCaseType].showOutput}
            staffOnly={visibility[testCaseType].staffOnly}
            testCases={testCasesOfType}
            testCaseType={testCaseType}
            testResults={testResults?.[testCaseType]}
          />
        );
      })}

      {showOutputStreams && (
        <>
          <OutputStream
            output={stdout}
            outputStreamType="standardOutput"
            staffOnly={showStdoutAndStderr === false}
          />

          <OutputStream
            output={stderr}
            outputStreamType="standardError"
            staffOnly={showStdoutAndStderr === false}
          />
        </>
      )}
    </div>
  );
};

export default memo(TestCases);
