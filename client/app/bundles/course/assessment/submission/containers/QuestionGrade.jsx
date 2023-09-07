import { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Chip, Paper, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import TextField from 'lib/components/core/fields/TextField';

import actionTypes from '../constants';
import { questionGradeShape, questionShape } from '../propTypes';
import translations from '../translations';

const GRADE_STEP = 1;

/**
 * Checks if the given value is a valid decimal of the form `0.00`.
 *
 * @param {string} value the string to be checked
 * @returns `true` if `value` is a valid decimal
 */
const isValidDecimal = (value) => /^\d*(\.\d?)?$/.test(value);

class VisibleQuestionGrade extends Component {
  processValue(value, drafting) {
    const { id, question, updateGrade, bonusAwarded } = this.props;

    if (value.trim() === '') {
      updateGrade(id, null, bonusAwarded);
      return;
    }

    if (drafting && !isValidDecimal(value)) return;

    const maxGrade = question.maximumGrade;
    const parsedValue = parseFloat(value);

    if (!drafting && (Number.isNaN(parsedValue) || parsedValue < 0)) {
      updateGrade(id, null, bonusAwarded);
      return;
    }

    if (parsedValue >= maxGrade) {
      updateGrade(id, maxGrade, bonusAwarded);
    } else {
      updateGrade(id, drafting ? value : parsedValue, bonusAwarded);
    }
  }

  stepGrade(delta) {
    const { id, question, grading, updateGrade, bonusAwarded } = this.props;

    const maxGrade = question.maximumGrade;
    const parsedValue = parseFloat(grading.grade) || 0;
    const newGrade = Math.max(Math.min(parsedValue + delta, maxGrade), 0);
    updateGrade(id, newGrade, bonusAwarded);
  }

  renderQuestionGrade() {
    const { question, grading } = this.props;

    return (
      <Typography variant="body2">
        {`${grading.grade} / ${question.maximumGrade}`}
      </Typography>
    );
  }

  renderQuestionGradeField(dirty) {
    const { question, grading, intl } = this.props;

    const maxGrade = question.maximumGrade;

    return (
      <div className="flex w-full items-center space-x-2">
        <div className="flex items-center space-x-4">
          <TextField
            className="w-40"
            hiddenLabel
            inputProps={{ className: 'grade' }}
            onBlur={(e) => this.processValue(e.target.value)}
            onChange={(e) => this.processValue(e.target.value, true)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.stepGrade(GRADE_STEP);
              }

              if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.stepGrade(-GRADE_STEP);
              }
            }}
            placeholder={grading.originalGrade}
            size="small"
            value={grading.grade ?? ''}
            variant="filled"
          />

          <Typography color="text.disabled" variant="body2">
            /
          </Typography>

          <Typography variant="body2">{maxGrade}</Typography>
        </div>

        <div className="px-4 space-x-4">
          {grading.prefilled && (
            <Tooltip
              title={intl.formatMessage(translations.gradePrefilledHint)}
            >
              <Chip
                className="slot-1-neutral-400 border-slot-1 text-slot-1"
                label={intl.formatMessage(translations.gradePrefilled)}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}

          {dirty && (
            <Tooltip title={intl.formatMessage(translations.gradeUnsavedHint)}>
              <Chip
                color="warning"
                label={intl.formatMessage(translations.gradeUnsaved)}
                size="small"
              />
            </Tooltip>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { grading, editable, intl } = this.props;

    if (!grading) return null;

    const dirty = +grading.originalGrade !== +grading.grade;

    return (
      <Paper
        className={`transition-none flex items-center space-x-5 px-5 py-4 ring-2 ${
          dirty ? 'ring-2 ring-warning border-transparent' : 'ring-transparent'
        }`}
        variant="outlined"
      >
        <Typography color="text.secondary" variant="body1">
          {intl.formatMessage(translations.grade)}
        </Typography>

        {editable
          ? this.renderQuestionGradeField(dirty)
          : this.renderQuestionGrade()}
      </Paper>
    );
  }
}

VisibleQuestionGrade.propTypes = {
  editable: PropTypes.bool.isRequired,
  grading: questionGradeShape,
  id: PropTypes.number.isRequired,
  question: questionShape,
  updateGrade: PropTypes.func.isRequired,
  bonusAwarded: PropTypes.number,
  intl: PropTypes.object.isRequired,
};

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { id } = ownProps;
  const { submittedAt, bonusEndAt, bonusPoints } = submission.submission;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;
  return {
    question: submission.questions[id],
    grading: submission.grading.questions[id],
    bonusAwarded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateGrade: (id, grade, bonusAwarded) =>
      dispatch({
        type: actionTypes.UPDATE_GRADING,
        id,
        grade,
        bonusAwarded,
      }),
  };
}

const QuestionGrade = connect(
  mapStateToProps,
  mapDispatchToProps,
)(VisibleQuestionGrade);

export default injectIntl(QuestionGrade);
