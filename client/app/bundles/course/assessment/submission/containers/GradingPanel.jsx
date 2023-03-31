import { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import Warning from '@mui/icons-material/Warning';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import PropTypes from 'prop-types';

import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatLongDateTime } from 'lib/moment';

import actionTypes, { workflowStates } from '../constants';
import { gradingShape, questionShape, submissionShape } from '../propTypes';
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
      .filter((grade) => grade !== null)
      .reduce((acc, b) => acc + (parseFloat(b.grade) || 0), 0);
  }

  static renderCourseUserLink(courseUser) {
    const courseId = getCourseId();
    if (courseUser && courseUser.id) {
      return (
        <a href={getCourseUserURL(courseId, courseUser.id)}>
          {courseUser.name}
        </a>
      );
    }
    if (courseUser) {
      // System or deleted users should not be linked to
      return courseUser.name;
    }
    return null;
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
    const { updateMultiplier, bonusAwarded } = this.props;
    const parsedValue = parseFloat(value);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      updateMultiplier(0, bonusAwarded);
    } else if (parsedValue > 1) {
      updateMultiplier(1, bonusAwarded);
    } else {
      updateMultiplier(parsedValue, bonusAwarded);
    }
  }

  renderExperiencePoints() {
    const {
      grading: { exp, expMultiplier },
      submission: { basePoints, graderView },
      bonusAwarded,
    } = this.props;

    if (!graderView) {
      return exp;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>
          <input
            ref={(ref) => {
              this.expInputRef = ref;
            }}
            className="exp"
            min={0}
            onChange={(e) => this.handleExpField(e.target.value)}
            onWheel={() => this.expInputRef.blur()}
            step={1}
            style={{ width: 50 }}
            type="number"
            value={exp !== null ? exp : ''}
          />
          {bonusAwarded > 0
            ? ` / (${basePoints} + ${bonusAwarded})`
            : ` / ${basePoints}`}
        </div>
        <div style={{ marginLeft: 20 }}>
          <FormattedMessage {...translations.multiplier} />
          <input
            ref={(ref) => {
              this.multiplierInputRef = ref;
            }}
            max={1}
            min={0}
            onChange={(e) => this.handleMultiplierField(e.target.value)}
            onWheel={() => this.multiplierInputRef.blur()}
            step="any"
            style={{ marginLeft: 5, width: 70 }}
            type="number"
            value={expMultiplier}
          />
        </div>
      </div>
    );
  }

  renderGradeRow(question, showGrader) {
    const questionGrading = this.props.grading.questions[question.id];
    const parsedGrade = parseFloat(questionGrading?.grade);
    const questionGrade = Number.isNaN(parsedGrade) ? '' : parsedGrade;

    const grader = questionGrading && questionGrading.grader;

    const courseId = getCourseId();

    let graderInfo = null;
    if (showGrader) {
      if (grader && grader.id) {
        graderInfo = (
          <a href={getCourseUserURL(courseId, grader.id)}>{grader.name}</a>
        );
      } else if (grader) {
        // System or deleted users should not be linked to
        graderInfo = grader.name;
      } else {
        graderInfo = '';
      }
    }
    return (
      <TableRow key={question.id}>
        <TableCell colSpan={2} style={styles.headerColumn}>
          {question.displayTitle}
        </TableCell>
        {showGrader ? (
          <TableCell style={styles.headerColumn}>{graderInfo}</TableCell>
        ) : null}
        <TableCell>{`${questionGrade} / ${question.maximumGrade}`}</TableCell>
      </TableRow>
    );
  }

  renderGradeTable() {
    const {
      intl,
      questions,
      questionIds,
      submission: { graderView, workflowState },
    } = this.props;

    if (!graderView && workflowState !== workflowStates.Published) {
      return null;
    }

    if (Object.values(questions).length === 0) {
      return null;
    }

    const showGrader =
      graderView &&
      (workflowState === workflowStates.Graded ||
        workflowState === workflowStates.Published);

    return (
      <div>
        <h4>{intl.formatMessage(translations.gradeSummary)}</h4>
        <Table style={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} style={styles.headerColumn}>
                {intl.formatMessage(translations.question)}
              </TableCell>
              {showGrader ? (
                <TableCell style={styles.headerColumn}>
                  {intl.formatMessage(translations.grader)}
                </TableCell>
              ) : null}
              <TableCell style={styles.headerColumn}>
                {intl.formatMessage(translations.totalGrade)}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questionIds.map((questionId) =>
              this.renderGradeRow(questions[questionId], showGrader),
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  renderSubmissionStatus() {
    const {
      intl,
      submission: { workflowState },
    } = this.props;
    return (
      <div className="flex flex-row items-center">
        {intl.formatMessage(translations[workflowState])}
        {workflowState === workflowStates.Graded ? (
          <span style={{ display: 'inline-block', marginLeft: 5 }}>
            <a
              data-for="unpublished-grades"
              data-offset="{'left' : -8}"
              data-tip
            >
              <Warning fontSize="small" />
            </a>
            <ReactTooltip effect="solid" id="unpublished-grades">
              <FormattedMessage {...translations.unpublishedGrades} />
            </ReactTooltip>
          </span>
        ) : null}
      </div>
    );
  }

  renderSubmissionTable() {
    const {
      submission: {
        workflowState,
        bonusEndAt,
        dueAt,
        attemptedAt,
        submittedAt,
        submitter,
        gradedAt,
        grader,
        graderView,
      },
      gamified,
      intl,
    } = this.props;

    const published = workflowState === workflowStates.Published;
    const shouldRenderGrading = published || graderView;

    const tableRow = (field, value) => (
      <TableRow>
        <TableCell style={styles.headerColumn}>
          <FormattedMessage {...translations[field]} />
        </TableCell>
        <TableCell>{value}</TableCell>
      </TableRow>
    );

    return (
      <div>
        <h4>{intl.formatMessage(translations.statistics)}</h4>
        <Table style={styles.table}>
          <TableBody>
            {tableRow(
              'student',
              VisibleGradingPanel.renderCourseUserLink(submitter),
            )}
            {tableRow('status', this.renderSubmissionStatus())}
            {shouldRenderGrading
              ? tableRow('totalGrade', this.renderTotalGrade())
              : null}
            {shouldRenderGrading && gamified
              ? tableRow('expAwarded', this.renderExperiencePoints())
              : null}
            {bonusEndAt
              ? tableRow('bonusEndAt', formatLongDateTime(bonusEndAt))
              : null}
            {dueAt ? tableRow('dueAt', formatLongDateTime(dueAt)) : null}
            {tableRow('attemptedAt', formatLongDateTime(attemptedAt))}
            {tableRow('submittedAt', formatLongDateTime(submittedAt))}
            {shouldRenderGrading
              ? tableRow(
                  'grader',
                  VisibleGradingPanel.renderCourseUserLink(grader),
                )
              : null}
            {shouldRenderGrading
              ? tableRow('gradedAt', formatLongDateTime(gradedAt))
              : null}
          </TableBody>
        </Table>
      </div>
    );
  }

  renderTotalGrade() {
    const {
      grading: { questions },
      submission: { maximumGrade },
    } = this.props;
    return (
      <div>{`${VisibleGradingPanel.calculateTotalGrade(
        questions,
      )} / ${maximumGrade}`}</div>
    );
  }

  render() {
    return (
      <div style={styles.panel}>
        <Card>
          <CardContent>{this.renderSubmissionTable()}</CardContent>
          <CardContent>{this.renderGradeTable()}</CardContent>
        </Card>
      </div>
    );
  }
}

VisibleGradingPanel.propTypes = {
  intl: PropTypes.object.isRequired,
  gamified: PropTypes.bool.isRequired,
  grading: gradingShape.isRequired,
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(questionShape),
  submission: submissionShape.isRequired,
  updateExp: PropTypes.func.isRequired,
  updateMultiplier: PropTypes.func.isRequired,
  bonusAwarded: PropTypes.number,
};

function mapStateToProps(state) {
  const { submittedAt, bonusEndAt, bonusPoints } = state.submission;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;
  return {
    gamified: state.assessment.gamified,
    grading: state.grading,
    questionIds: state.assessment.questionIds,
    questions: state.questions,
    submission: state.submission,
    bonusAwarded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateExp: (exp) => dispatch({ type: actionTypes.UPDATE_EXP, exp }),
    updateMultiplier: (multiplier, bonusAwarded) =>
      dispatch({
        type: actionTypes.UPDATE_MULTIPLIER,
        multiplier,
        bonusAwarded,
      }),
  };
}

const GradingPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(VisibleGradingPanel));
export default GradingPanel;
