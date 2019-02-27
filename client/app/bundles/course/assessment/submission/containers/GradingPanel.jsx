import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn, TableRowColumn } from 'material-ui/Table';
import ReactTooltip from 'react-tooltip';

import { getCourseId } from 'lib/helpers/url-helpers';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { formatDateTime } from '../utils';
import { gradingShape, questionShape, submissionShape } from '../propTypes';
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
    const { updateMultiplier } = this.props;
    const parsedValue = parseFloat(value);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      updateMultiplier(0);
    } else if (parsedValue > 1) {
      updateMultiplier(1);
    } else {
      const multiplier = parseFloat(parsedValue.toFixed(1));
      updateMultiplier(multiplier);
    }
  }

  renderTotalGrade() {
    const { grading: { questions }, submission: { maximumGrade } } = this.props;
    return <div>{`${VisibleGradingPanel.calculateTotalGrade(questions)} / ${maximumGrade}`}</div>;
  }

  renderSubmissionStatus() {
    const { intl, submission: { workflowState } } = this.props;
    return (
      <div>
        {intl.formatMessage(translations[workflowState])}
        {workflowState === workflowStates.Graded ? (
          <span style={{ display: 'inline-block', marginLeft: 5 }}>
            <a data-tip data-for="unpublished-grades" data-offset="{'left' : -8}">
              <i className="fa fa-exclamation-triangle" />
            </a>
            <ReactTooltip id="unpublished-grades" effect="solid">
              <FormattedMessage {...translations.unpublishedGrades} />
            </ReactTooltip>
          </span>
        ) : null}
      </div>
    );
  }

  renderExperiencePoints() {
    const {
      grading: { exp, expMultiplier },
      submission: { basePoints, graderView },
    } = this.props;

    if (!graderView) {
      return exp;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 80 }}>
          <input
            style={{ width: 50 }}
            type="number"
            min={0}
            step={1}
            value={exp !== null ? exp : ''}
            onChange={e => this.handleExpField(e.target.value)}
            ref={(ref) => {
              this.expInputRef = ref;
            }}
            onWheel={() => this.expInputRef.blur()}
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
            ref={(ref) => {
              this.multiplierInputRef = ref;
            }}
            onWheel={() => this.multiplierInputRef.blur()}
          />
        </div>
      </div>
    );
  }

  renderSubmissionTable() {
    const {
      submission: {
        submitter, workflowState, bonusEndAt, dueAt, attemptedAt,
        submittedAt, grader, gradedAt, graderView,
      },
      gamified, intl,
    } = this.props;

    const published = workflowState === workflowStates.Published;
    const shouldRenderGrading = published || graderView;

    const tableRow = (field, value) => (
      <TableRow>
        <TableHeaderColumn style={styles.headerColumn} columnNumber={0}>
          <FormattedMessage {...translations[field]} />
        </TableHeaderColumn>
        <TableRowColumn>{value}</TableRowColumn>
      </TableRow>
    );

    return (
      <div>
        <h4>{intl.formatMessage(translations.statistics)}</h4>
        <Table selectable={false} style={styles.table}>
          <TableBody displayRowCheckbox={false}>
            {tableRow('student', submitter)}
            {tableRow('status', this.renderSubmissionStatus())}
            {shouldRenderGrading ? tableRow('totalGrade', this.renderTotalGrade()) : null}
            {shouldRenderGrading && gamified ? tableRow('expAwarded', this.renderExperiencePoints()) : null}
            {bonusEndAt ? tableRow('bonusEndAt', formatDateTime(bonusEndAt)) : null}
            {dueAt ? tableRow('dueAt', formatDateTime(dueAt)) : null}
            {tableRow('attemptedAt', formatDateTime(attemptedAt))}
            {tableRow('submittedAt', formatDateTime(submittedAt))}
            {shouldRenderGrading ? tableRow('grader', grader) : null}
            {shouldRenderGrading ? tableRow('gradedAt', formatDateTime(gradedAt)) : null}
          </TableBody>
        </Table>
      </div>
    );
  }

  renderGradeRow(question, showGrader) {
    const questionGrading = this.props.grading.questions[question.id];
    const questionGrade = questionGrading && questionGrading.grade !== null ? questionGrading.grade : '';
    const grader = questionGrading && questionGrading.grader;

    const courseId = getCourseId();

    let graderInfo = null;
    if (showGrader) {
      if (grader && grader.id) {
        graderInfo = <a href={getCourseUserURL(courseId, grader.id)}>{grader.name}</a>;
      } else if (grader) {
        graderInfo = grader.name;
      } else {
        graderInfo = '';
      }
    }
    return (
      <TableRow key={question.id}>
        <TableHeaderColumn style={styles.headerColumn} colSpan={2}>
          {question.displayTitle}
        </TableHeaderColumn>
        {showGrader
          ? (
            <TableHeaderColumn style={styles.headerColumn}>
              {graderInfo}
            </TableHeaderColumn>
          )
          : null}
        <TableRowColumn>{`${questionGrade} / ${question.maximumGrade}`}</TableRowColumn>
      </TableRow>
    );
  }

  renderGradeTable() {
    const { intl, questions, questionIds, submission: { graderView, workflowState } } = this.props;

    if (!graderView && workflowState !== workflowStates.Published) {
      return null;
    }

    if (Object.values(questions).length <= 0) {
      return null;
    }

    const showGrader = graderView && (
      workflowState === workflowStates.Graded || workflowState === workflowStates.Published);

    return (
      <div>
        <h4>{intl.formatMessage(translations.gradeSummary)}</h4>
        <Table selectable={false} style={styles.table}>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false} enableSelectAll={false}>
            <TableRow>
              <TableHeaderColumn style={styles.headerColumn} colSpan={2}>
                {intl.formatMessage(translations.question)}
              </TableHeaderColumn>
              { showGrader
                ? (
                  <TableHeaderColumn style={styles.headerColumn}>
                    {intl.formatMessage(translations.grader)}
                  </TableHeaderColumn>
                )
                : null }
              <TableHeaderColumn style={styles.headerColumn}>
                {intl.formatMessage(translations.totalGrade)}
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {
              questionIds.map(questionId => this.renderGradeRow(questions[questionId], showGrader))
            }
          </TableBody>
        </Table>
      </div>
    );
  }

  render() {
    return (
      <div style={styles.panel}>
        <Card>
          <CardText>{this.renderSubmissionTable()}</CardText>
          <CardText>{this.renderGradeTable()}</CardText>
        </Card>
      </div>
    );
  }
}

VisibleGradingPanel.propTypes = {
  intl: intlShape.isRequired,
  gamified: PropTypes.bool.isRequired,
  grading: gradingShape.isRequired,
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(questionShape),
  submission: submissionShape.isRequired,
  updateExp: PropTypes.func.isRequired,
  updateMultiplier: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    gamified: state.assessment.gamified,
    grading: state.grading,
    questionIds: state.assessment.questionIds,
    questions: state.questions,
    submission: state.submission,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateExp: exp => dispatch({ type: actionTypes.UPDATE_EXP, exp }),
    updateMultiplier: multiplier => dispatch({ type: actionTypes.UPDATE_MULTIPLIER, multiplier }),
  };
}

const GradingPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(VisibleGradingPanel));
export default GradingPanel;
