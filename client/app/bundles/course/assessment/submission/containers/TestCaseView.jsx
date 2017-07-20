import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';

import ReactTooltip from 'react-tooltip';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import WrongIcon from 'material-ui/svg-icons/navigation/close';
import CorrectIcon from 'material-ui/svg-icons/action/done';
import { red50, green50 } from 'material-ui/styles/colors';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';

import ExpandableText from 'lib/components/ExpandableText';
import { TestCaseProp } from '../propTypes';

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

  static renderOutputStream(outputStreamType, output) {
    return (
      <Card>
        <CardHeader
          showExpandableButton
          title={
            <div>
              <FormattedMessage {...translations[outputStreamType]} />
              {VisibleTestCaseView.renderStaffOnlyOutputStreamWarning()}
            </div>
          }
        />
        <CardText expandable><pre>{output}</pre></CardText>
      </Card>
    );
  }

  static renderTitle(testCaseType, warn) {
    return (
      <div>
        <FormattedMessage {...translations[testCaseType]} />
        {warn ? VisibleTestCaseView.renderStaffOnlyTestCasesWarning() : null}
      </div>
    );
  }

  renderTestCases(testCases, title) {
    const { canGrade } = this.props;

    if (!testCases || testCases.length === 0) {
      return null;
    }

    const tableHeaderColumnFor = field => (
      <TableHeaderColumn style={styles.testCaseCell}>
        <FormattedMessage {...translations[field]} />
      </TableHeaderColumn>
    );

    return (
      <Card>
        <CardHeader title={title} />
        <CardText>
          <Table selectable={false} style={{}}>
            <TableHeader displaySelectAll={false}>
              <TableRow>
                { canGrade ? tableHeaderColumnFor('identifier') : null }
                { tableHeaderColumnFor('expression') }
                { tableHeaderColumnFor('expected') }
                { canGrade ? tableHeaderColumnFor('output') : null }
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
    const { canGrade } = this.props;

    let testCaseResult = 'unattempted';
    let testCaseIcon;
    if (testCase.output) {
      testCaseResult = testCase.passed ? 'correct' : 'wrong';
      testCaseIcon = testCase.passed ? <CorrectIcon /> : <WrongIcon />;
    }

    const tableRowColumnFor = field => (
      <TableRowColumn style={styles.testCaseCell}>{field}</TableRowColumn>
    );

    return (
      <TableRow key={testCase.identifier} style={styles.testCaseRow[testCaseResult]}>
        { canGrade ? tableRowColumnFor(testCase.identifier) : null }
        {tableRowColumnFor(testCase.expression)}
        {tableRowColumnFor(<ExpandableText text={testCase.expected || ''} /> || '')}
        { canGrade ? tableRowColumnFor(<ExpandableText text={testCase.output || ''} /> || '') : null }
        <TableRowColumn>{testCaseIcon}</TableRowColumn>
      </TableRow>
    );
  }

  render() {
    const { testCases, canGrade } = this.props;
    if (!testCases) {
      return null;
    }

    return (
      <div style={styles.testCasesContainer}>
        <h3><FormattedMessage {...translations.testCases} /></h3>
        {this.renderTestCases(
          testCases.public_test,
          VisibleTestCaseView.renderTitle('publicTestCases', false)
        )}
        {this.renderTestCases(
          testCases.private_test,
          VisibleTestCaseView.renderTitle('privateTestCases', canGrade)
        )}
        {this.renderTestCases(
          testCases.evaluation_test,
          VisibleTestCaseView.renderTitle('evaluationTestCases', canGrade)
        )}
        {canGrade ? VisibleTestCaseView.renderOutputStream('standardOutput', testCases.stdout) : null}
        {canGrade ? VisibleTestCaseView.renderOutputStream('standardError', testCases.stderr) : null}
      </div>
    );
  }
}

VisibleTestCaseView.propTypes = {
  canGrade: PropTypes.bool,
  testCases: PropTypes.shape({
    evaluation_test: PropTypes.arrayOf(TestCaseProp),
    private_test: PropTypes.arrayOf(TestCaseProp),
    public_test: PropTypes.arrayOf(TestCaseProp),
    stdout: PropTypes.string,
    stderr: PropTypes.string,
  }),
};

function mapStateToProps(state, ownProps) {
  const { questionId } = ownProps;
  return {
    testCases: state.testCases[questionId],
  };
}

const TestCaseView = connect(
  mapStateToProps
)(VisibleTestCaseView);
export default TestCaseView;
