import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { red900 } from 'material-ui/styles/colors';

import { QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import Comments from '../../components/Comments';

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
    const { canGrade, questionIds, questions, topics } = this.props;
    return (
      <Tabs>
        {questionIds.map((id, index) => {
          const question = questions[id];
          const { answerId, topicId } = question;
          const topic = topics[topicId];
          return (
            <Tab key={id} label={index + 1}>
              <SubmissionAnswer {...{ canGrade, answerId, question }} />
              <Comments topic={topic} />
            </Tab>
          );
        })}
      </Tabs>
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
      <Card style={styles.questionContainer}>
        <form>{this.renderQuestions()}</form>
        <hr />
        {this.renderSaveDraftButton()}
        {this.renderSubmitButton()}
        {this.renderUnsubmitButton()}
      </Card>
    );
  }
}

SubmissionEditTabForm.propTypes = {
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
})(SubmissionEditTabForm);
