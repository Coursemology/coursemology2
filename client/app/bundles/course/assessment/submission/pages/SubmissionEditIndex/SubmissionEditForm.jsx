import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { red900 } from 'material-ui/styles/colors';

import { QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import Comments from '../../components/Comments';

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
    const { canGrade, questionIds, questions, topics } = this.props;
    return (
      <div>
        {questionIds.map((id) => {
          const question = questions[id];
          const { answerId, topicId } = question;
          const topic = topics[topicId];
          return (
            <div key={id} style={styles.questionContainer}>
              <SubmissionAnswer {...{ canGrade, answerId, question }} />
              <Comments topic={topic} />
              <hr />
            </div>
          );
        })}
      </div>
    );
  }

  renderSaveDraftButton() {
    const { pristine, submitting, submitted, handleSaveDraft } = this.props;
    if (!submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label="Save Draft"
          onTouchTap={handleSaveDraft}
          disabled={pristine || submitting}
        />
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { submitting, submitted, handleSubmit } = this.props;
    if (!submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          secondary
          label="Finalise Submission"
          onTouchTap={handleSubmit}
          disabled={submitting}
        />
      );
    }
    return null;
  }

  renderUnsubmitButton() {
    const { canGrade, submitted, handleUnsubmit } = this.props;
    if (canGrade && submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label="Unsubmit Submission"
          onTouchTap={handleUnsubmit}
        />
      );
    }
    return null;
  }

  render() {
    return (
      <Card style={styles.questionCardContainer}>
        <form>
          {this.renderQuestions()}
        </form>
        {this.renderSaveDraftButton()}
        {this.renderSubmitButton()}
        {this.renderUnsubmitButton()}
      </Card>
    );
  }
}

SubmissionEditForm.propTypes = {
  canGrade: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(QuestionProp),
  topics: PropTypes.objectOf(TopicProp),
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  handleSaveDraft: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditForm);
