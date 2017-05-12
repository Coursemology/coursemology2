import React, { Component, PropTypes } from 'react';
import { FieldArray, reduxForm } from 'redux-form';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

import { QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import Comments from '../../components/Comments';
import CommentField from '../../components/CommentField';

const styles = {
  questionContainer: {
    marginTop: 20,
    padding: 20,
  },
  formButton: {
    marginRight: 10,
  },
};

class SubmissionEditTabForm extends Component {

  renderQuestions() {
    const { canGrade, questions, topics } = this.props;
    return (
      <Tabs>
        {questions.allIds.map((id, index) => {
          const question = questions.byId[id];
          const answerId = question.answerId;
          const topic = topics[question.topicId];
          return (
            <Tab key={id} label={index + 1}>
              <SubmissionAnswer {...{ canGrade, answerId, question }} />
              <Comments topic={topic} />
              <CommentField />
            </Tab>
          );
        })}
      </Tabs>
    );
  }

  render() {
    const { canGrade, topics, pristine, submitting, handleSubmit } = this.props;
    return (
      <Card style={styles.questionContainer}>
        <form>
          <FieldArray
            name="answers"
            component={SubmissionEditTabForm.renderAnswers}
            {...{ canGrade, topics }}
          />
        </form>
        <hr />
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
          disabled={pristine || submitting}
        />
      </Card>
    );
  }
}

SubmissionEditTabForm.propTypes = {
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
})(SubmissionEditTabForm);
