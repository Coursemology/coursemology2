import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { grey100 } from 'material-ui/styles/colors';

import { GradingProp, QuestionProp } from '../propTypes';
import actionTypes from '../constants';

const styles = {
  container: {
    marginTop: 20,
  },
};

class VisibleQuestionGrade extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    questions: PropTypes.objectOf(QuestionProp),
    grading: GradingProp.isRequired,
    updateGrade: PropTypes.func.isRequired,
  };

  handleGradingField(value) {
    const { id, questions, updateGrade } = this.props;
    const maxGrade = questions[id].maximumGrade;
    const parsedValue = parseFloat(value);

    if (isNaN(parsedValue) || parsedValue < 0) {
      updateGrade(id, 0);
    } else if (parsedValue > maxGrade) {
      updateGrade(id, maxGrade);
    } else {
      updateGrade(id, parseFloat(parsedValue.toFixed(1)));
    }
  }

  render() {
    const { id, questions, grading } = this.props;
    const initialGrade = grading.questions[id].grade;
    const maxGrade = questions[id].maximumGrade;
    return (
      <Card style={styles.container}>
        <CardHeader style={{ backgroundColor: grey100 }} title="Grading" />
        <CardText>
          <input
            style={{ width: 100 }}
            type="number"
            min={0}
            max={maxGrade}
            step={1}
            value={initialGrade}
            onChange={e => this.handleGradingField(e.target.value)}
          />
          {` / ${maxGrade}`}
        </CardText>
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    questions: state.questions,
    grading: state.grading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateGrade: (id, grade) => dispatch({ type: actionTypes.UPDATE_GRADING, id, grade }),
  };
}

const QuestionGrade = connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleQuestionGrade);
export default QuestionGrade;
