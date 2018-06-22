import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';

import ReactTooltip from 'react-tooltip';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import WrongIcon from 'material-ui/svg-icons/navigation/close';
import CorrectIcon from 'material-ui/svg-icons/action/done';
import { red50, yellow100, green50, red100, green100 } from 'material-ui/styles/colors';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import Paper from 'material-ui/Paper';

import ExpandableText from 'lib/components/ExpandableText';
import { testCaseShape } from '../propTypes';
import { workflowStates } from '../constants';

const styles = {
  testCaseRow: {
    unattempted: {},
    correct: { backgroundColor: green50 },
    wrong: { backgroundColor: red50 },
  },
  testCaseCell: {
    padding: '0.5em',
    textOverflow: 'initial',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
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
    defaultMessage: 'You are able to view these test cases because you are staff. \
                    Students will not be able to see them.',
  },
  staffOnlyOutputStream: {
    id: 'course.assessment.submission.TestCaseView.staffOnlyOutputStream',
    defaultMessage: 'You can view the output streams because you are staff. \
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
    defaultMessage: 'The answer is currently being evaluated, come back after a while \
                    to see the latest results.',
  },
});

class VisibleTestCaseView extends Component {
  static renderStaffOnlyTestCasesWarning() {
    return (
      <span style={{ display: 'inline-block', marginLeft: 5 }}>
        <a data-tip data-for="staff-only-test-cases" data-offset="{'left' : -8}">
          <i className="fa fa-exclamation-triangle" />
        </a>
        <ReactTooltip id="staff-only-test-cases" effect="solid">
          <FormattedMessage {...translations.staffOnlyTestCases} />
        </ReactTooltip>
      </span>
    );
  }

  static renderStaffOnlyOutputStreamWarning() {
    return (
      <span style={{ display: 'inline-block', marginLeft: 5 }}>
        <a data-tip data-for="staff-only-output-stream" data-offset="{'left' : -8}">
          <i className="fa fa-exclamation-triangle" />
        </a>
        <ReactTooltip id="staff-only-output-stream" effect="solid">
          <FormattedMessage {...translations.staffOnlyOutputStream} />
        </ReactTooltip>
      </span>
    );
  }

  static renderOutputStream(outputStreamType, output, showStaffOnlyWarning) {
    return (
      <Card>
        <CardHeader
          showExpandableButton
          title={
            <React.Fragment>
              <FormattedMessage {...translations[outputStreamType]} />
              {showStaffOnlyWarning && VisibleTestCaseView.renderStaffOnlyOutputStreamWarning()}
            </React.Fragment>
          }
        />
        <CardText expandable><pre>{output}</pre></CardText>
      </Card>
    );
  }

  static renderTitle(testCaseType, warn) {
    return (
      <React.Fragment>
        <FormattedMessage {...translations[testCaseType]} />
        {warn && VisibleTestCaseView.renderStaffOnlyTestCasesWarning()}
      </React.Fragment>
    );
  }

  renderTestCases(testCases, title) {
    const { collapsible, testCases: { canReadTests } } = this.props;
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
    let headerStyle = {};
    if (collapsible) {
      headerStyle = { backgroundColor: passedTestCases ? green100 : red100 };
    }

    const tableHeaderColumnFor = field => (
      <TableHeaderColumn style={styles.testCaseCell}>
        <FormattedMessage {...translations[field]} />
      </TableHeaderColumn>
    );

    return (
      <Card>
        <CardHeader title={title} actAsExpander={collapsible} showExpandableButton={collapsible} style={headerStyle} />
        <CardText expandable={collapsible}>
          <Table selectable={false} style={{}}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                { canReadTests && tableHeaderColumnFor('identifier') }
                { tableHeaderColumnFor('expression') }
                { tableHeaderColumnFor('expected') }
                { (canReadTests || showPublicTestCasesOutput) && tableHeaderColumnFor('output') }
                { tableHeaderColumnFor('passed') }
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {testCases.map(this.renderTestCaseRow.bind(this))}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }

  renderTestCaseRow(testCase) {
    const { testCases: { canReadTests } } = this.props;
    const { showPublicTestCasesOutput } = this.props;

    let testCaseResult = 'unattempted';
    let testCaseIcon;
    if (testCase.passed !== undefined) {
      testCaseResult = testCase.passed ? 'correct' : 'wrong';
      testCaseIcon = testCase.passed ? <CorrectIcon /> : <WrongIcon />;
    }

    const tableRowColumnFor = field => (
      <TableRowColumn style={styles.testCaseCell}>{field}</TableRowColumn>
    );

    const outputStyle = { whiteSpace: 'pre-wrap', fontFamily: 'monospace' };

    return (
      <TableRow key={testCase.identifier} style={styles.testCaseRow[testCaseResult]}>
        { canReadTests && tableRowColumnFor(testCase.identifier) }
        {tableRowColumnFor(testCase.expression)}
        {tableRowColumnFor(<ExpandableText style={outputStyle} text={testCase.expected || ''} /> || '')}
        { (canReadTests || showPublicTestCasesOutput) &&
          tableRowColumnFor(<ExpandableText style={outputStyle} text={testCase.output || ''} /> || '') }
        {tableRowColumnFor(testCaseIcon)}
      </TableRow>
    );
  }

  render() {
    const {
      submissionState, showPrivate, showEvaluation, graderView,
      isAutograding, testCases, collapsible, showStdoutAndStderr,
    } = this.props;
    if (!testCases) {
      return null;
    }

    const attempting = (submissionState === workflowStates.Attempting);
    const published = (submissionState === workflowStates.Published);
    const showOutputStreams = (graderView || showStdoutAndStderr);
    const showPrivateTest = testCases.canReadTests || (published && showPrivate);
    const showEvaluationTest = testCases.canReadTests || (published && showEvaluation);
    return (
      <div style={styles.testCasesContainer}>
        { !attempting && isAutograding &&
          <Paper style={{ padding: 10, backgroundColor: yellow100, marginBottom: 20 }}>
            <FormattedMessage {...translations.autogradeProgress} />
          </Paper>
        }
        <h3><FormattedMessage {...translations.testCases} /></h3>
        {this.renderTestCases(
          testCases.public_test,
          VisibleTestCaseView.renderTitle('publicTestCases', false)
        )}
        {showPrivateTest && this.renderTestCases(
          testCases.private_test,
          VisibleTestCaseView.renderTitle('privateTestCases', testCases.canReadTests)
        )}
        {showEvaluationTest && this.renderTestCases(
          testCases.evaluation_test,
          VisibleTestCaseView.renderTitle('evaluationTestCases', testCases.canReadTests)
        )}
        {(showOutputStreams && !collapsible) && VisibleTestCaseView.renderOutputStream(
          'standardOutput', testCases.stdout, !showStdoutAndStderr
        )}
        {(showOutputStreams && !collapsible) && VisibleTestCaseView.renderOutputStream(
          'standardError', testCases.stderr, !showStdoutAndStderr
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

const TestCaseView = connect(
  mapStateToProps
)(VisibleTestCaseView);
export default TestCaseView;
