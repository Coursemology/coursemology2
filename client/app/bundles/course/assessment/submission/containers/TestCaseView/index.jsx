import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Tooltip } from 'react-tooltip';
import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Warning from '@mui/icons-material/Warning';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { green, red, yellow } from '@mui/material/colors';
import PropTypes from 'prop-types';

import Expandable from 'lib/components/core/Expandable';

import { workflowStates } from '../../constants';
import { testCaseShape } from '../../propTypes';

const styles = {
  panel: {
    margin: 0,
  },
  panelSummary: {
    fontSize: 16,
  },
  testCaseRow: {
    unattempted: {},
    correct: { backgroundColor: green[50] },
    wrong: { backgroundColor: red[50] },
  },
  testCasesContainer: {
    marginBottom: 20,
  },
};

const translations = defineMessages({
  testCases: {
    id: 'course.assessment.submission.TestCaseView.testCases',
    defaultMessage: 'Test Cases',
  },
  identifier: {
    id: 'course.assessment.submission.TestCaseView.identifier',
    defaultMessage: 'Identifier',
  },
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
  passed: {
    id: 'course.assessment.submission.TestCaseView.passed',
    defaultMessage: 'Passed',
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
    defaultMessage:
      'You are able to view these test cases because you are staff. \
                    Students will not be able to see them.',
  },
  staffOnlyOutputStream: {
    id: 'course.assessment.submission.TestCaseView.staffOnlyOutputStream',
    defaultMessage:
      'You can view the output streams because you are staff. \
                    Students will not be able to see them.',
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
});

export class VisibleTestCaseView extends Component {
  static renderOutputStream(outputStreamType, output, showStaffOnlyWarning) {
    return (
      <Accordion
        defaultExpanded={false}
        id={outputStreamType}
        style={styles.panel}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={styles.panelSummary}
        >
          <>
            <FormattedMessage {...translations[outputStreamType]} />
            {showStaffOnlyWarning &&
              VisibleTestCaseView.renderStaffOnlyOutputStreamWarning(
                outputStreamType,
              )}
          </>
        </AccordionSummary>
        <AccordionDetails>
          <pre style={{ width: '100%' }}>{output}</pre>
        </AccordionDetails>
      </Accordion>
    );
  }

  static renderConditionalOutputStreamIcon(outputStreamType) {
    if (outputStreamType === 'standardOutput') {
      return <Warning id="warning-icon-standard-output" />;
    }
    return <Warning id="warning-icon-standard-error" />;
  }

  static renderStaffOnlyOutputStreamWarning(outputStreamType) {
    return (
      <span style={{ display: 'inline-block', marginLeft: 5 }}>
        <a data-tooltip-id="staff-only-output-stream" data-tooltip-offset={8}>
          {VisibleTestCaseView.renderConditionalOutputStreamIcon(
            outputStreamType,
          )}
        </a>

        <Tooltip id="staff-only-output-stream">
          <FormattedMessage {...translations.staffOnlyOutputStream} />
        </Tooltip>
      </span>
    );
  }

  static renderStaffOnlyTestCasesWarning(testCaseType) {
    return (
      <span style={{ display: 'inline-block', marginLeft: 5 }}>
        <a data-tooltip-id="staff-only-test-cases" data-tooltip-offset={8}>
          {VisibleTestCaseView.renderConditionalTestCaseWarningIcon(
            testCaseType,
          )}
        </a>

        <Tooltip id="staff-only-test-cases">
          <FormattedMessage {...translations.staffOnlyTestCases} />
        </Tooltip>
      </span>
    );
  }

  static renderConditionalTestCaseWarningIcon(testCaseType) {
    if (testCaseType === 'publicTestCases') {
      return <Warning id="warning-icon-public-test-cases" />;
    }
    if (testCaseType === 'privateTestCases') {
      return <Warning id="warning-icon-private-test-cases" />;
    }
    return <Warning id="warning-icon-evaluation-test-cases" />;
  }

  static renderTitle(testCaseType, warn) {
    return (
      <>
        <FormattedMessage {...translations[testCaseType]} />
        {warn &&
          VisibleTestCaseView.renderStaffOnlyTestCasesWarning(testCaseType)}
      </>
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
      testCaseIcon = testCase.passed ? <Check /> : <Clear />;
    }

    const tableRowColumnFor = (field) => (
      <TableCell style={styles.testCaseCell}>{field}</TableCell>
    );

    return (
      <TableRow
        key={testCase.identifier}
        style={styles.testCaseRow[testCaseResult]}
      >
        {canReadTests && tableRowColumnFor(truncatedIdentifier)}

        {tableRowColumnFor(
          <Expandable over={40}>
            <Typography className="h-full break-all font-mono text-[1.3rem]">
              {testCase.expression}
            </Typography>
          </Expandable>,
        )}

        {tableRowColumnFor(
          <Expandable over={40}>
            <Typography className="h-full break-all font-mono text-[1.3rem]">
              {testCase.expected || ''}
            </Typography>
          </Expandable>,
        )}

        {(canReadTests || showPublicTestCasesOutput) &&
          tableRowColumnFor(
            <Expandable over={40}>
              <Typography className="h-full break-all font-mono text-[1.3rem]">
                {testCase.output || ''}
              </Typography>
            </Expandable>,
          )}

        {tableRowColumnFor(testCaseIcon)}
      </TableRow>
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

    const passedTestCases = testCases.reduce((val, testCase) => {
      if (testCase.passed !== undefined) {
        return val && testCase.passed;
      }
      return val;
    }, true);
    let headerStyle = { ...styles.panelSummary };
    if (collapsible && !isDraftAnswer) {
      headerStyle = {
        ...headerStyle,
        backgroundColor: passedTestCases ? green[100] : red[100],
      };
    }

    const tableHeaderColumnFor = (field) => (
      <TableCell style={styles.testCaseCell}>
        <FormattedMessage {...translations[field]} />
      </TableCell>
    );

    const title = VisibleTestCaseView.renderTitle(testCaseType, warn);

    return (
      <Accordion
        defaultExpanded={!collapsible}
        id={testCaseType}
        style={styles.panel}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} style={headerStyle}>
          {title}
        </AccordionSummary>
        <AccordionDetails style={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                {canReadTests && tableHeaderColumnFor('identifier')}
                {tableHeaderColumnFor('expression')}
                {tableHeaderColumnFor('expected')}
                {((graderView && canReadTests) || showPublicTestCasesOutput) &&
                  tableHeaderColumnFor('output')}
                {tableHeaderColumnFor('passed')}
              </TableRow>
            </TableHead>
            <TableBody>
              {testCases.map(this.renderTestCaseRow.bind(this))}
            </TableBody>
          </Table>
        </AccordionDetails>
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
      <div style={styles.testCasesContainer}>
        {isAutograding && (
          <Paper
            style={{
              padding: 10,
              backgroundColor: yellow[100],
              marginBottom: 20,
            }}
          >
            <FormattedMessage {...translations.autogradeProgress} />
          </Paper>
        )}
        <h3>
          <FormattedMessage {...translations.testCases} />
        </h3>
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
