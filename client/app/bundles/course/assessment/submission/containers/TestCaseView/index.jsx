import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
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
} from '@material-ui/core';
import { green, yellow, red } from '@mui/material/colors';
import Check from '@material-ui/icons/Check';
import Clear from '@material-ui/icons/Clear';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandableText from 'lib/components/ExpandableText';
import { testCaseShape } from '../../propTypes';
import { workflowStates } from '../../constants';

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
              VisibleTestCaseView.renderStaffOnlyOutputStreamWarning()}
          </>
        </AccordionSummary>
        <AccordionDetails>
          <pre style={{ width: '100%' }}>{output}</pre>
        </AccordionDetails>
      </Accordion>
    );
  }

  static renderStaffOnlyOutputStreamWarning() {
    return (
      <span style={{ display: 'inline-block', marginLeft: 5 }}>
        <a
          data-tip
          data-for="staff-only-output-stream"
          data-offset="{'left' : -8}"
        >
          <i className="fa fa-exclamation-triangle" />
        </a>
        <ReactTooltip id="staff-only-output-stream" effect="solid">
          <FormattedMessage {...translations.staffOnlyOutputStream} />
        </ReactTooltip>
      </span>
    );
  }

  static renderStaffOnlyTestCasesWarning() {
    return (
      <span style={{ display: 'inline-block', marginLeft: 5 }}>
        <a
          data-tip
          data-for="staff-only-test-cases"
          data-offset="{'left' : -8}"
        >
          <i className="fa fa-exclamation-triangle" />
        </a>
        <ReactTooltip id="staff-only-test-cases" effect="solid">
          <FormattedMessage {...translations.staffOnlyTestCases} />
        </ReactTooltip>
      </span>
    );
  }

  static renderTitle(testCaseType, warn) {
    return (
      <>
        <FormattedMessage {...translations[testCaseType]} />
        {warn && VisibleTestCaseView.renderStaffOnlyTestCasesWarning()}
      </>
    );
  }

  renderTestCaseRow(testCase) {
    const {
      testCases: { canReadTests },
    } = this.props;
    const { showPublicTestCasesOutput } = this.props;

    let testCaseResult = 'unattempted';
    let testCaseIcon;
    if (testCase.passed !== undefined) {
      testCaseResult = testCase.passed ? 'correct' : 'wrong';
      testCaseIcon = testCase.passed ? <Check /> : <Clear />;
    }

    const tableRowColumnFor = (field) => (
      <TableCell style={styles.testCaseCell}>{field}</TableCell>
    );

    const outputStyle = { whiteSpace: 'pre-wrap', fontFamily: 'monospace' };

    return (
      <TableRow
        key={testCase.identifier}
        style={styles.testCaseRow[testCaseResult]}
      >
        {canReadTests && tableRowColumnFor(testCase.identifier)}
        {tableRowColumnFor(
          <ExpandableText style={outputStyle} text={testCase.expression} />,
        )}
        {tableRowColumnFor(
          (
            <ExpandableText
              style={outputStyle}
              text={testCase.expected || ''}
            />
          ) || '',
        )}
        {(canReadTests || showPublicTestCasesOutput) &&
          tableRowColumnFor(
            (
              <ExpandableText
                style={outputStyle}
                text={testCase.output || ''}
              />
            ) || '',
          )}
        {tableRowColumnFor(testCaseIcon)}
      </TableRow>
    );
  }

  renderTestCases(testCases, testCaseType, warn) {
    const {
      collapsible,
      testCases: { canReadTests },
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
    if (collapsible) {
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
        <AccordionDetails>
          <Table>
            <TableHead>
              <TableRow>
                {canReadTests && tableHeaderColumnFor('identifier')}
                {tableHeaderColumnFor('expression')}
                {tableHeaderColumnFor('expected')}
                {(canReadTests || showPublicTestCasesOutput) &&
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
    } = this.props;
    if (!testCases) {
      return null;
    }

    const attempting = submissionState === workflowStates.Attempting;
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
        {!attempting && isAutograding && (
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
        {this.renderTestCases(testCases.public_test, 'publicTestCases', false)}
        {showPrivateTest &&
          this.renderTestCases(
            testCases.private_test,
            'privateTestCases',
            !showPrivateTestToStudents,
          )}
        {showEvaluationTest &&
          this.renderTestCases(
            testCases.evaluation_test,
            'evaluationTestCases',
            !showEvaluationTestToStudents,
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
};

function mapStateToProps(state, ownProps) {
  const { questionId, answerId, viewHistory } = ownProps;
  let testCases;
  let isAutograding;
  if (viewHistory) {
    testCases = state.history.testCases[answerId];
    isAutograding = false;
  } else {
    testCases = state.testCases[questionId];
    isAutograding = state.questionsFlags[questionId].isAutograding;
  }

  return {
    submissionState: state.submission.workflowState,
    graderView: state.submission.graderView,
    showPublicTestCasesOutput: state.submission.showPublicTestCasesOutput,
    showStdoutAndStderr: state.submission.showStdoutAndStderr,
    showPrivate: state.assessment.showPrivate,
    showEvaluation: state.assessment.showEvaluation,
    collapsible: viewHistory,
    isAutograding,
    testCases,
  };
}

const TestCaseView = connect(mapStateToProps)(VisibleTestCaseView);
export default TestCaseView;
