import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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
                  <TableHeaderColumn>Identifier</TableHeaderColumn>
                  <TableHeaderColumn>Expression</TableHeaderColumn>
                  <TableHeaderColumn>Expected</TableHeaderColumn>
                  <TableHeaderColumn>Output</TableHeaderColumn>
                  <TableHeaderColumn>Hint</TableHeaderColumn>
                  <TableHeaderColumn>Passed</TableHeaderColumn>
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
          You are able to view these test cases because you are staff. Students will not be able to see them.
        </ReactTooltip>
      </div>
    );
  }

  static renderTitle(title, warn) {
    return (
      <div>
        {title}
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
        <h3>Test Cases</h3>
        {VisibleTestCaseView.renderTestCases(
          testCases.public_test,
          VisibleTestCaseView.renderTitle('Public Test Cases', false)
        )}
        {canGrade ? VisibleTestCaseView.renderTestCases(
          testCases.private_test,
          VisibleTestCaseView.renderTitle('Private Test Cases', true)
        ) : null}
        {canGrade ? VisibleTestCaseView.renderTestCases(
          testCases.evaluation_test,
          VisibleTestCaseView.renderTitle('Evaluation Test Cases', true)
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
