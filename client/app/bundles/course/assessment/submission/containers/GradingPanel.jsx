import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn, TableRowColumn } from 'material-ui/Table';

import { formatDateTime } from '../utils';
import { GradingProp, QuestionProp, SubmissionProp } from '../propTypes';
import actionTypes from '../constants';
import translations from '../translations';

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
          <FormattedMessage {...translations.multiplier} />
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
      }, intl,
    } = this.props;

    const tableRow = (field, value) => (
      <TableRow>
        <TableHeaderColumn style={styles.hdColumn} columnNumber={0}>
          <FormattedMessage {...translations[field]} />
        </TableHeaderColumn>
        <TableRowColumn>{value}</TableRowColumn>
      </TableRow>
    );

    return (
      <Table selectable={false} style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          {tableRow('student', submitter)}
          {tableRow('status', intl.formatMessage(translations[workflowState]))}
          {tableRow('totalGrade', this.renderTotalGrade())}
          {tableRow('expAwarded', this.renderExperiencePoints())}
          {tableRow('dueAt', formatDateTime(dueAt))}
          {tableRow('attemptedAt', formatDateTime(attemptedAt))}
          {tableRow('submittedAt', formatDateTime(submittedAt))}
          {tableRow('grader', grader)}
          {tableRow('gradedAt', formatDateTime(gradedAt))}
        </TableBody>
      </Table>
    );
  }

  renderGradeRow(question) {
    const { grading } = this.props;
    const questionGrade = grading.questions[question.id] ? grading.questions[question.id].grade : 0;
    return (
      <TableRow key={question.id}>
        <TableHeaderColumn
          style={styles.hdColumn}
          columnNumber={0}
        >
          {question.displayTitle}
        </TableHeaderColumn>
        <TableRowColumn>{`${questionGrade} / ${question.maximumGrade}`}</TableRowColumn>
      </TableRow>
    );
  }

  renderGradeTable() {
    const { intl, questions } = this.props;
    return (
      <div>
        <h1>Grade Summary</h1>
        <Table selectable={false} style={styles.table}>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false} enableSelectAll={false}>
            <TableRow>
              <TableHeaderColumn style={styles.hdColumn}>
                {intl.formatMessage(translations.question)}
              </TableHeaderColumn>
              <TableHeaderColumn style={styles.hdColumn}>
                {intl.formatMessage(translations.totalGrade)}
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {Object.values(questions).map(question => this.renderGradeRow(question))}
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
  intl: intlShape.isRequired,
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
)(injectIntl(VisibleGradingPanel));
export default GradingPanel;
