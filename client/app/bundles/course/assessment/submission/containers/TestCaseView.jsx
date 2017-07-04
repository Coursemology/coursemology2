import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';

import ReactTooltip from 'react-tooltip';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import WrongIcon from 'material-ui/svg-icons/navigation/close';
import CorrectIcon from 'material-ui/svg-icons/action/done';
import { red100, green100 } from 'material-ui/styles/colors';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';

import { TestCaseProp } from '../propTypes';

const styles = {
  testCase: {
    unattempted: {},
    correct: { backgroundColor: green100 },
    wrong: { backgroundColor: red100 },
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
  hint: {
    id: 'course.assessment.submission.TestCaseView.hint',
    defaultMessage: 'Hint',
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
  staffOnlyVisibleTestCase: {
    id: 'course.assessment.submission.TestCaseView.staffOnlyVisibleTestCase',
    defaultMessage: 'You are able to view these test cases because you are staff. \
                    Students will not be able to see them.',
  },
});

class VisibleTestCaseView extends Component {

  static renderTestCaseRow(testCase) {
    let testCaseResult = 'unattempted';
    let testCaseIcon;
    if (testCase.output) {
      testCaseResult = testCase.passed ? 'correct' : 'wrong';
      testCaseIcon = testCase.passed ? <CorrectIcon /> : <WrongIcon />;
    }

    return (
      <TableRow key={testCase.identifier} style={styles.testCase[testCaseResult]}>
        <TableRowColumn>{testCase.identifier}</TableRowColumn>
        <TableRowColumn>{testCase.expression}</TableRowColumn>
        <TableRowColumn>{testCase.expected}</TableRowColumn>
        <TableRowColumn>{testCase.output}</TableRowColumn>
        <TableRowColumn dangerouslySetInnerHTML={{ __html: testCase.hint }} />
        <TableRowColumn>{testCaseIcon}</TableRowColumn>
      </TableRow>
    );
  }

  static renderTestCases(testCases, title) {
    if (!testCases || testCases.length === 0) {
      return null;
    }

    return (
      <div>
        <Card>
          <CardHeader
            title={title}
            style={{}}
          />
          <CardText>
            <Table selectable={false} style={{}}>
              <TableHeader displaySelectAll={false}>
                <TableRow>
                  <TableHeaderColumn><FormattedMessage {...translations.identifier} /></TableHeaderColumn>
                  <TableHeaderColumn><FormattedMessage {...translations.expression} /></TableHeaderColumn>
                  <TableHeaderColumn><FormattedMessage {...translations.expected} /></TableHeaderColumn>
                  <TableHeaderColumn><FormattedMessage {...translations.output} /></TableHeaderColumn>
                  <TableHeaderColumn><FormattedMessage {...translations.hint} /></TableHeaderColumn>
                  <TableHeaderColumn><FormattedMessage {...translations.passed} /></TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                {testCases.map(VisibleTestCaseView.renderTestCaseRow)}
              </TableBody>
            </Table>
          </CardText>
        </Card>
      </div>
    );
  }

  static renderExclamationTriangle() {
    return (
      <div>
        <a data-tip data-for="exclamation-triangle"><i className="fa fa-exclamation-triangle" /></a>
        <ReactTooltip id="exclamation-triangle" effect="solid">
          <FormattedMessage {...translations.staffOnlyVisibleTestCase} />
        </ReactTooltip>
      </div>
    );
  }

  static renderTitle(testCaseType, warn) {
    return (
      <div>
        <FormattedMessage {...translations[testCaseType]} />
        {warn ? VisibleTestCaseView.renderExclamationTriangle() : null}
      </div>
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
        {VisibleTestCaseView.renderTestCases(
          testCases.public_test,
          VisibleTestCaseView.renderTitle('publicTestCases', false)
        )}
        {canGrade ? VisibleTestCaseView.renderTestCases(
          testCases.private_test,
          VisibleTestCaseView.renderTitle('privateTestCases', true)
        ) : null}
        {canGrade ? VisibleTestCaseView.renderTestCases(
          testCases.evaluation_test,
          VisibleTestCaseView.renderTitle('evaluationTestCases', true)
        ) : null}
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
