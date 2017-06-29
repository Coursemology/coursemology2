import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn, TableRowColumn } from 'material-ui/Table';

import { formatDateTime } from '../utils';
import { GradingProp, QuestionProp, SubmissionProp } from '../propTypes';
import actionTypes from '../constants';

const styles = {
  panel: {
    marginTop: 20,
    marginBottom: 20,
  },
  table: {
    maxWidth: 600,
  },
  hdColumn: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  },
};

class VisibleGradingPanel extends Component {
  static calculateTotalGrade(grades) {
    return Object.values(grades).reduce((acc, b) => acc + b.grade, 0);
  }

  handleExpField(value) {
    const { updateExp } = this.props;
    const parsedValue = parseFloat(value);

    if (parsedValue < 0) {
      updateExp(0);
    } else {
      updateExp(parseFloat(parsedValue.toFixed(1)));
    }
  }

  handleMultiplierField(value) {
    const {
      grading: { questions },
      submission: { maximumGrade, basePoints },
      updateMultiplier,
    } = this.props;
    const totalGrade = VisibleGradingPanel.calculateTotalGrade(questions);
    const defaultExp = (totalGrade / maximumGrade) * basePoints;
    const parsedValue = parseFloat(value);

    if (isNaN(parsedValue) || parsedValue < 0) {
      updateMultiplier(0, 0);
    } else if (parsedValue > 1) {
      updateMultiplier(defaultExp, 1);
    } else {
      const multiplier = parseFloat(parsedValue.toFixed(1));
      updateMultiplier(defaultExp * multiplier, multiplier);
    }
  }

  renderTotalGrade() {
    const { grading: { questions }, submission: { maximumGrade } } = this.props;
    return <div>{`${VisibleGradingPanel.calculateTotalGrade(questions)} / ${maximumGrade}`}</div>;
  }

  renderExperiencePoints() {
    const {
      grading: { questions, exp, expMultiplier },
      submission: { basePoints, maximumGrade },
    } = this.props;
    const totalGrade = VisibleGradingPanel.calculateTotalGrade(questions);
    const defaultExp = (totalGrade / maximumGrade) * basePoints * expMultiplier;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 80 }}>
          <input
            style={{ width: 50 }}
            type="number"
            min={0}
            step={1}
            value={exp || defaultExp}
            onChange={e => this.handleExpField(e.target.value)}
          />
          {` / ${basePoints}`}
        </div>
        <div style={{ marginLeft: 20 }}>
          Multiplier
          <input
            style={{ marginLeft: 5, width: 50 }}
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={expMultiplier}
            onChange={e => this.handleMultiplierField(e.target.value)}
          />
        </div>
      </div>
    );
  }

  renderSubmissionTable() {
    const {
      submission: {
        submitter, workflowState, dueAt, attemptedAt,
        submittedAt, grader, gradedAt,
      },
    } = this.props;
    return (
      <Table selectable={false} style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>Student</TableHeaderColumn>
            <TableRowColumn>{submitter}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>Status</TableHeaderColumn>
            <TableRowColumn>{workflowState}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>Total Grade</TableHeaderColumn>
            <TableRowColumn>{this.renderTotalGrade()}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>Experience Points Awarded</TableHeaderColumn>
            <TableRowColumn>{this.renderExperiencePoints()}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>Due At</TableHeaderColumn>
            <TableRowColumn>{formatDateTime(dueAt)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>Attempted At</TableHeaderColumn>
            <TableRowColumn>{formatDateTime(attemptedAt)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>Submitted At</TableHeaderColumn>
            <TableRowColumn>{formatDateTime(submittedAt)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>Grader</TableHeaderColumn>
            <TableRowColumn>{grader}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>Graded At</TableHeaderColumn>
            <TableRowColumn>{formatDateTime(gradedAt)}</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderGradeTable() {
    const { questions, grading } = this.props;
    return (
      <div>
        <h1>Grade Summary</h1>
        <Table selectable={false} style={styles.table}>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false} enableSelectAll={false}>
            <TableRow>
              <TableHeaderColumn style={styles.hdColumn}>Question</TableHeaderColumn>
              <TableHeaderColumn style={styles.hdColumn}>Total Grade</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {Object.values(questions).map(question =>
              <TableRow key={question.id}>
                <TableHeaderColumn
                  style={styles.hdColumn}
                  columnNumber={0}
                >
                  {question.displayTitle}
                </TableHeaderColumn>
                <TableRowColumn>{`${grading.questions[question.id].grade} / ${question.maximumGrade}`}</TableRowColumn>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  render() {
    return (
      <div style={styles.panel}>
        <Card>
          <CardHeader title="Statistics" />
          <CardText>{this.renderSubmissionTable()}</CardText>
          <CardText>{this.renderGradeTable()}</CardText>
        </Card>
      </div>
    );
  }
}

VisibleGradingPanel.propTypes = {
  questions: PropTypes.objectOf(QuestionProp),
  submission: SubmissionProp.isRequired,
  grading: GradingProp.isRequired,
  updateExp: PropTypes.func.isRequired,
  updateMultiplier: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    questions: state.questions,
    submission: state.submissionEdit.submission,
    grading: state.grading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateExp: exp => dispatch({ type: actionTypes.UPDATE_EXP, exp }),
    updateMultiplier: (exp, multiplier) => dispatch({ type: actionTypes.UPDATE_MULTIPLIER, exp, multiplier }),
  };
}

const GradingPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleGradingPanel);
export default GradingPanel;
