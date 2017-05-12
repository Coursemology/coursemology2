import React, { Component, PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

import { QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import Comments from '../../components/Comments';
import CommentField from '../../components/CommentField';

const styles = {
  questionCardContainer: {
    marginTop: 20,
    padding: 40,
  },
  questionContainer: {
    paddingTop: 10,
  },
  formButton: {
    marginRight: 10,
  },
};

class SubmissionEditForm extends Component {

  renderQuestions() {
    const { canGrade, questions, topics } = this.props;
    return (
      <div>
        {questions.allIds.map((id) => {
          const question = questions.byId[id];
          const answerId = question.answerId;
          const topic = topics[question.topicId];
          return (
            <div key={id} style={styles.questionContainer}>
              <SubmissionAnswer {...{ canGrade, answerId, question }} />
              <Comments topic={topic} />
              <CommentField />
              <hr />
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const {
      canGrade, pristine, submitting, handleSubmit,
    } = this.props;
    return (
      <Card style={styles.questionCardContainer}>
        <form>
          {this.renderQuestions()}
        </form>
        <RaisedButton
          style={styles.formButton}
          primary
          label="Save Draft"
          onTouchTap={handleSubmit}
          disabled={pristine || submitting}
        />
        <RaisedButton
          style={styles.formButton}
          secondary
          label="Finalise Submission"
          onTouchTap={() => handleSubmit('finalise')}
          disabled={submitting}
        />
        <RaisedButton
          style={styles.formButton}
          secondary
          label="Unsubmit Submission"
          onTouchTap={() => handleSubmit('unsubmit')}
          disabled={submitting}
        />
      </Card>
    );
  }
}

SubmissionEditForm.propTypes = {
  canGrade: PropTypes.bool.isRequired,
  questions: PropTypes.shape({
    byIds: PropTypes.objectOf(QuestionProp),
    allIds: PropTypes.arrayOf(PropTypes.number),
  }),
  topics: PropTypes.objectOf(TopicProp),
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  handleSubmit: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditForm);
