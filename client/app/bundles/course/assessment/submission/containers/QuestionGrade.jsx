import { Component } from 'react';
import { connect } from 'react-redux';
import { Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import actionTypes from '../constants';
import { questionGradeShape, questionShape } from '../propTypes';

const GRADE_STEP = 1;

const styles = {
  container: {
    marginTop: 20,
  },
};

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
      <div style={{ display: 'inline-block', paddingLeft: 10 }}>
        {`${grading.grade} / ${question.maximumGrade}`}
      </div>
    );
  }

  renderQuestionGradeField() {
    const { question, grading } = this.props;
    const initialGrade = grading.grade;
    const maxGrade = question.maximumGrade;

    return (
      <div style={{ display: 'inline-block', paddingLeft: 10 }}>
        <input
          className="grade"
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
          style={{ width: 100 }}
          value={initialGrade ?? ''}
        />
        {` / ${maxGrade}`}
      </div>
    );
  }

  render() {
    const { grading, editable } = this.props;

    if (!grading) {
      return null;
    }

    return (
      <Paper style={styles.container}>
        <div
          style={{
            backgroundColor: grey[100],
            display: 'inline-block',
            padding: 20,
          }}
        >
          Grading
        </div>
        {editable
          ? this.renderQuestionGradeField()
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
export default QuestionGrade;
