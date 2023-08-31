import { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ErrorIcon from '@mui/icons-material/Error';
import { Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import CustomTooltip from 'lib/components/core/CustomTooltip';
import TextField from 'lib/components/core/fields/TextField';

import actionTypes from '../constants';
import {
  explanationShape,
  questionGradeShape,
  questionShape,
} from '../propTypes';

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
    const { id, question, updateGrade, bonusAwarded, setGradeIsSaved } =
      this.props;

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

    setGradeIsSaved(false);
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

  renderQuestionGradeField() {
    const {
      explanations,
      question,
      grading,
      gradeIsUnsavedMessage,
      gradeIsSaved,
      id,
    } = this.props;
    let initialGrade = grading.grade;

    const maxGrade = question.maximumGrade;

    if (
      !initialGrade &&
      (!explanations[id] || explanations[id].correct) &&
      question.type === 'Programming'
    ) {
      initialGrade = initialGrade === 0 ? initialGrade : maxGrade;
      this.processValue(initialGrade.toString(), true);
    }

    return (
      <div className="flex items-center space-x-2">
        {!gradeIsSaved && (
          <CustomTooltip title={gradeIsUnsavedMessage}>
            <ErrorIcon
              color="error"
              fontSize="small"
              style={{ marginLeft: 5, marginTop: -4 }}
            />
          </CustomTooltip>
        )}
        <TextField
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
          size="small"
          style={{ width: 100 }}
          value={initialGrade ?? ''}
          variant="filled"
        />

        <Typography variant="body2">{` / ${maxGrade}`}</Typography>
      </div>
    );
  }

  render() {
    const { grading, editable } = this.props;

    if (!grading) {
      return null;
    }

    return (
      <Paper
        className="flex items-center space-x-5 px-5 py-4"
        variant="outlined"
      >
        <Typography color="text.secondary" variant="body1">
          Grade :
        </Typography>

        {editable
          ? this.renderQuestionGradeField()
          : this.renderQuestionGrade()}
      </Paper>
    );
  }
}

VisibleQuestionGrade.propTypes = {
  explanations: PropTypes.objectOf(explanationShape),
  gradeIsUnsavedMessage: PropTypes.node,
  gradeIsSaved: PropTypes.bool,
  setGradeIsSaved: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
  grading: questionGradeShape,
  id: PropTypes.number.isRequired,
  question: questionShape,
  updateGrade: PropTypes.func.isRequired,
  bonusAwarded: PropTypes.number,
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
