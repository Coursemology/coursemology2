import { Component, Fragment } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Done } from '@mui/icons-material';
import Clear from '@mui/icons-material/Clear';
import {
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { green, red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import Expandable from 'lib/components/core/Expandable';
import Accordion from 'lib/components/core/layouts/Accordion';

import { workflowStates } from '../../constants';
import { testCaseShape } from '../../propTypes';

const styles = {
  testCaseRow: {
    unattempted: {},
    correct: { backgroundColor: green[50] },
    wrong: { backgroundColor: red[50] },
  },
};

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
  staffOnlyTestCases: {
    id: 'course.assessment.submission.TestCaseView.staffOnlyTestCases',
    defaultMessage: 'Only staff can see this.',
  },
  staffOnlyOutputStream: {
    id: 'course.assessment.submission.TestCaseView.staffOnlyOutputStream',
    defaultMessage:
      "Only staff can see this. Students can't see output streams.",
  },
  standardOutput: {
    id: 'course.assessment.submission.TestCaseView.standardOutput',
    defaultMessage: 'Standard Output',
  },
  standardError: {
    id: 'course.assessment.submission.TestCaseView.standardError',
    defaultMessage: 'Standard Error',
  },
  autogradeProgress: {
    id: 'course.assessment.submission.TestCaseView.autogradeProgress',
    defaultMessage:
      'The answer is currently being evaluated, come back after a while \
                    to see the latest results.',
  },
  noOutputs: {
    id: 'course.assessment.submission.TestCaseView.noOutputs',
    defaultMessage: 'No outputs',
  },
});

export class VisibleTestCaseView extends Component {
  static renderOutputStream(outputStreamType, output, showStaffOnlyWarning) {
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
        style={styles.panel}
        subtitle={
          showStaffOnlyWarning && (
            <FormattedMessage {...translations.staffOnlyOutputStream} />
          )
        }
        title={<FormattedMessage {...translations[outputStreamType]} />}
      >
        <pre style={{ width: '100%' }}>{output}</pre>
      </Accordion>
    );
  }

  renderTestCaseRow(testCase) {
    const {
      testCases: { canReadTests },
    } = this.props;
    const { showPublicTestCasesOutput } = this.props;

    const nameRegex = /\/?(\w+)$/;
    const idMatch = testCase.identifier?.match(nameRegex);
    const truncatedIdentifier = idMatch ? idMatch[1] : '';

    let testCaseResult = 'unattempted';
    let testCaseIcon;
    if (testCase.passed !== undefined) {
      testCaseResult = testCase.passed ? 'correct' : 'wrong';
      testCaseIcon = testCase.passed ? (
        <Done color="success" />
      ) : (
        <Clear color="error" />
      );
    }

    return (
      <Fragment key={testCase.identifier}>
        {canReadTests && (
          <TableRow style={styles.testCaseRow[testCaseResult]}>
            <TableCell
              className="h-fit border-none pb-0 leading-none"
              colSpan={5}
            >
              <Typography
                className="break-all"
                color="text.secondary"
                variant="caption"
              >
                {truncatedIdentifier}
              </Typography>
            </TableCell>
          </TableRow>
        )}

        <TableRow style={styles.testCaseRow[testCaseResult]}>
          <TableCell className="w-full pt-1">
            <Expandable over={40}>
              <Typography className="h-full break-all font-mono text-[1.3rem]">
                {testCase.expression}
              </Typography>
            </Expandable>
          </TableCell>

          <TableCell className="w-full pt-1">
            <Expandable over={40}>
              <Typography className="h-full break-all font-mono text-[1.3rem]">
                {testCase.expected || ''}
              </Typography>
            </Expandable>
          </TableCell>

          {(canReadTests || showPublicTestCasesOutput) && (
            <TableCell className="w-full pt-1">
              <Expandable over={40}>
                <Typography className="h-full break-all font-mono text-[1.3rem]">
                  {testCase.output || ''}
                </Typography>
              </Expandable>
            </TableCell>
          )}

          <TableCell>{testCaseIcon}</TableCell>
        </TableRow>
      </Fragment>
    );
  }

  renderTestCases(testCases, testCaseType, warn, isDraftAnswer) {
    const {
      collapsible,
      testCases: { canReadTests },
      graderView,
    } = this.props;
    const { showPublicTestCasesOutput } = this.props;

    if (!testCases || testCases.length === 0) {
      return null;
    }

    const passedTestCases = testCases.reduce(
      (passed, testCase) => passed && testCase?.passed,
      true,
    );

    const shouldShowAllPassed = !isDraftAnswer && passedTestCases;

    return (
      <Accordion
        className={shouldShowAllPassed && 'border-success'}
        defaultExpanded={!collapsible}
        disableGutters
        icon={
          shouldShowAllPassed && (
            <Chip
              color="success"
              icon={<Done />}
              label={<FormattedMessage {...translations.allPassed} />}
              size="small"
              variant="outlined"
            />
          )
        }
        id={testCaseType}
        subtitle={
          warn && <FormattedMessage {...translations.staffOnlyTestCases} />
        }
        title={<FormattedMessage {...translations[testCaseType]} />}
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

              {((graderView && canReadTests) || showPublicTestCasesOutput) && (
                <TableCell className="w-full">
                  <FormattedMessage {...translations.output} />
                </TableCell>
              )}

              <TableCell className="w-24" />
            </TableRow>
          </TableHead>

          <TableBody>
            {testCases.map(this.renderTestCaseRow.bind(this))}
          </TableBody>
        </Table>
      </Accordion>
    );
  }

  render() {
    const {
      submissionState,
      showPrivate,
      showEvaluation,
      graderView,
      isAutograding,
      testCases,
      collapsible,
      showStdoutAndStderr,
      isDraftAnswer,
    } = this.props;
    if (!testCases) {
      return null;
    }

    const published = submissionState === workflowStates.Published;
    const showOutputStreams = graderView || showStdoutAndStderr;
    const showPrivateTestToStudents = published && showPrivate;
    const showEvaluationTestToStudents = published && showEvaluation;
    const showPrivateTest =
      (graderView && testCases.canReadTests) || showPrivateTestToStudents;
    const showEvaluationTest =
      (graderView && testCases.canReadTests) || showEvaluationTestToStudents;

    return (
      <div className="my-5 space-y-5">
        {isAutograding && (
          <Alert severity="info">
            <FormattedMessage {...translations.autogradeProgress} />
          </Alert>
        )}

        {this.renderTestCases(
          testCases.public_test,
          'publicTestCases',
          false,
          isDraftAnswer,
        )}

        {showPrivateTest &&
          this.renderTestCases(
            testCases.private_test,
            'privateTestCases',
            !showPrivateTestToStudents,
            isDraftAnswer,
          )}

        {showEvaluationTest &&
          this.renderTestCases(
            testCases.evaluation_test,
            'evaluationTestCases',
            !showEvaluationTestToStudents,
            isDraftAnswer,
          )}

        {showOutputStreams &&
          !collapsible &&
          VisibleTestCaseView.renderOutputStream(
            'standardOutput',
            testCases.stdout,
            !showStdoutAndStderr,
          )}

        {showOutputStreams &&
          !collapsible &&
          VisibleTestCaseView.renderOutputStream(
            'standardError',
            testCases.stderr,
            !showStdoutAndStderr,
          )}
      </div>
    );
  }
}

VisibleTestCaseView.propTypes = {
  submissionState: PropTypes.string,
  graderView: PropTypes.bool,
  // Show public test cases output to students.
  showPublicTestCasesOutput: PropTypes.bool,
  // Show stdout and stderr output streams to students.
  showStdoutAndStderr: PropTypes.bool,
  // flags to show private or evaluation tests after submission is graded
  showPrivate: PropTypes.bool,
  showEvaluation: PropTypes.bool,
  isAutograding: PropTypes.bool,
  collapsible: PropTypes.bool,
  testCases: PropTypes.shape({
    canReadTests: PropTypes.bool,
    evaluation_test: PropTypes.arrayOf(testCaseShape),
    private_test: PropTypes.arrayOf(testCaseShape),
    public_test: PropTypes.arrayOf(testCaseShape),
    stdout: PropTypes.string,
    stderr: PropTypes.string,
  }),
  isDraftAnswer: PropTypes.bool,
};

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { questionId, answerId, viewHistory, isDraftAnswer } = ownProps;
  let testCases;
  let isAutograding;
  if (viewHistory) {
    testCases = submission.history.testCases[answerId];
    isAutograding = false;
  } else {
    testCases = submission.testCases[questionId];
    isAutograding = submission.questionsFlags[questionId].isAutograding;
  }

  return {
    submissionState: submission.submission.workflowState,
    graderView: submission.submission.graderView,
    showPublicTestCasesOutput: submission.submission.showPublicTestCasesOutput,
    showStdoutAndStderr: submission.submission.showStdoutAndStderr,
    showPrivate: submission.assessment.showPrivate,
    showEvaluation: submission.assessment.showEvaluation,
    collapsible: viewHistory,
    isAutograding,
    testCases,
    isDraftAnswer,
  };
}

const TestCaseView = connect(mapStateToProps)(VisibleTestCaseView);
export default TestCaseView;
