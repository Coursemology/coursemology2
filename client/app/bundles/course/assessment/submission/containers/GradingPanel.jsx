import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn, TableRowColumn } from 'material-ui/Table';
import ReactTooltip from 'react-tooltip';

import { formatDateTime } from '../utils';
import { GradingProp, QuestionProp, SubmissionProp } from '../propTypes';
import actionTypes, { workflowStates } from '../constants';
import translations from '../translations';

const styles = {
  panel: {
    marginTop: 20,
    marginBottom: 20,
  },
  table: {
    maxWidth: 600,
  },
  headerColumn: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    overflow: 'hidden',
  },
};

class VisibleGradingPanel extends Component {
  static calculateTotalGrade(grades) {
    return Object.values(grades)
      .filter(grade => grade !== null)
      .reduce((acc, b) => acc + b.grade, 0);
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

  renderSubmissionStatus() {
    const { intl, submission: { workflowState } } = this.props;
    return (<div>
      {intl.formatMessage(translations[workflowState])}
      {workflowState === workflowStates.Graded ? (
        <span style={{ display: 'inline-block', marginLeft: 5 }}>
          <a data-tip data-for="staff-only-test-cases" data-offset="{'left' : -8}">
            <i className="fa fa-exclamation-triangle" />
          </a>
          <ReactTooltip id="staff-only-test-cases" effect="solid">
            <FormattedMessage {...translations.unpublishedGrades} />
          </ReactTooltip>
        </span>
      ) : null}
    </div>);
  }

  renderExperiencePoints() {
    const {
      grading: { questions, exp, expMultiplier },
      submission: { basePoints, maximumGrade, canGrade },
    } = this.props;

    if (!canGrade) {
      return exp;
    }

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
        submittedAt, grader, gradedAt, canGrade,
      },
    } = this.props;

    const published = workflowState === workflowStates.Published;
    const shouldRenderGrading = published || canGrade;

    const tableRow = (field, value) => (
      <TableRow>
        <TableHeaderColumn style={styles.headerColumn} columnNumber={0}>
          <FormattedMessage {...translations[field]} />
        </TableHeaderColumn>
        <TableRowColumn>{value}</TableRowColumn>
      </TableRow>
    );

    return (
      <Table selectable={false} style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          {tableRow('student', submitter)}
          {tableRow('status', this.renderSubmissionStatus())}
          {shouldRenderGrading ? tableRow('totalGrade', this.renderTotalGrade()) : null}
          {shouldRenderGrading ? tableRow('expAwarded', this.renderExperiencePoints()) : null}
          {tableRow('dueAt', formatDateTime(dueAt))}
          {tableRow('attemptedAt', formatDateTime(attemptedAt))}
          {tableRow('submittedAt', formatDateTime(submittedAt))}
          {shouldRenderGrading ? tableRow('grader', grader) : null}
          {shouldRenderGrading ? tableRow('gradedAt', formatDateTime(gradedAt)) : null}
        </TableBody>
      </Table>
    );
  }

  renderGradeRow(question) {
    const questionGrading = this.props.grading.questions[question.id];
    const questionGrade = questionGrading && questionGrading.grade !== null ? questionGrading.grade : '';
    return (
      <TableRow key={question.id}>
        <TableHeaderColumn style={styles.headerColumn} columnNumber={0} colSpan={2}>
          {question.displayTitle}
        </TableHeaderColumn>
        <TableRowColumn>{`${questionGrade} / ${question.maximumGrade}`}</TableRowColumn>
      </TableRow>
    );
  }

  renderGradeTable() {
    const { intl, questions, submission: { canGrade, workflowState } } = this.props;

    if (!canGrade && workflowState !== workflowStates.Published) {
      return null;
    }

    return (
      <div>
        <h4>Grade Summary</h4>
        <Table selectable={false} style={styles.table}>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false} enableSelectAll={false}>
            <TableRow>
              <TableHeaderColumn style={styles.headerColumn} colSpan={2}>
                {intl.formatMessage(translations.question)}
              </TableHeaderColumn>
              <TableHeaderColumn style={styles.headerColumn}>
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
    submission: state.submission,
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
