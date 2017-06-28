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
    grading: PropTypes.objectOf(GradingProp).isRequired,
    updateGrade: PropTypes.func.isRequired,
  };

  render() {
    const { id, questions, grading, updateGrade } = this.props;
    const initialGrade = grading[id].grade;
    const maxGrade = questions[id].maximumGrade;
    return (
      <Card style={styles.container}>
        <CardHeader style={{ backgroundColor: grey100 }} title="Grading" />
        <CardText>
          <input
            style={{ width: '100px' }}
            type="number"
            min="0"
            max={maxGrade.toString()}
            step="1"
            value={initialGrade}
            onChange={e => updateGrade(id, parseFloat(parseFloat(e.target.value).toPrecision(1)))}
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
