import { Component } from 'react';
import { connect } from 'react-redux';
import { Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import actionTypes from '../constants';
import { questionGradeShape, questionShape } from '../propTypes';

const styles = {
  container: {
    marginTop: 20,
  },
};

class VisibleQuestionGrade extends Component {
  handleGradingField(value) {
    const { id, question, updateGrade, bonusAwarded } = this.props;
    const maxGrade = question.maximumGrade;
    const parsedValue = parseFloat(value);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      updateGrade(id, 0, bonusAwarded);
    } else if (parsedValue > maxGrade) {
      updateGrade(id, maxGrade, bonusAwarded);
    } else {
      updateGrade(id, parseFloat(parsedValue.toFixed(1)), bonusAwarded);
    }
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
          ref={(ref) => {
            this.inputRef = ref;
          }}
          className="grade"
          max={maxGrade}
          min={0}
          onChange={(e) => this.handleGradingField(e.target.value)}
          onWheel={() => this.inputRef.blur()}
          step={1}
          style={{ width: 100 }}
          type="number"
          value={initialGrade === null ? '' : initialGrade}
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

function mapStateToProps(state, ownProps) {
  const { id } = ownProps;
  const { submittedAt, bonusEndAt, bonusPoints } = state.submission;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;
  return {
    question: state.questions[id],
    grading: state.grading.questions[id],
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
