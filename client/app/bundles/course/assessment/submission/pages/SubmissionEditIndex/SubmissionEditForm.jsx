import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { red900 } from 'material-ui/styles/colors';

import { QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import QuestionGrade from '../../containers/QuestionGrade';
import GradingPanel from '../../containers/GradingPanel';
import Comments from '../../containers/Comments';
import SubmitDialog from '../../components/SubmitDialog';
import UnsubmitDialog from '../../components/UnsubmitDialog';

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
  constructor(props) {
    super(props);

    this.state = {
      submitConfirmation: false,
      unsubmitConfirmation: false,
    };
  }

  renderQuestionGrading(id) {
    const { submitted } = this.props;
    if (submitted) {
      return <QuestionGrade id={id} />;
    }
    return null;
  }

  renderQuestions() {
    const { canGrade, submitted, questionIds, questions, topics } = this.props;
    return (
      <div>
        {questionIds.map((id) => {
          const question = questions[id];
          const { answerId, topicId } = question;
          const topic = topics[topicId];
          return (
            <div key={id} style={styles.questionContainer}>
              <SubmissionAnswer {...{ canGrade, readOnly: submitted, answerId, question }} />
              {this.renderQuestionGrading(id)}
              <Comments topic={topic} />
              <hr />
            </div>
          );
        })}
      </div>
    );
  }

  renderGradingPanel() {
    const { submitted } = this.props;
    if (submitted) {
      return <GradingPanel />;
    }
    return null;
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
    const { submitting, submitted } = this.props;
    if (!submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          secondary
          label="Finalise Submission"
          onTouchTap={() => this.setState({ submitConfirmation: true })}
          disabled={submitting}
        />
      );
    }
    return null;
  }

  renderUnsubmitButton() {
    const { canGrade, submitted } = this.props;
    if (canGrade && submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label="Unsubmit Submission"
          onTouchTap={() => this.setState({ unsubmitConfirmation: true })}
        />
      );
    }
    return null;
  }

  renderPublishButton() {
    const { canGrade, submitted, handlePublish } = this.props;
    if (canGrade && submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label="Publish Submission"
          onTouchTap={handlePublish}
        />
      );
    }
    return null;
  }

  renderSubmitDialog() {
    const { submitConfirmation } = this.state;
    const { handleSubmit } = this.props;
    return (
      <SubmitDialog
        open={submitConfirmation}
        onCancel={() => this.setState({ submitConfirmation: false })}
        onConfirm={() => {
          this.setState({ submitConfirmation: false });
          handleSubmit();
        }}
      />
    );
  }

  renderUnsubmitDialog() {
    const { unsubmitConfirmation } = this.state;
    const { handleUnsubmit } = this.props;
    return (
      <UnsubmitDialog
        open={unsubmitConfirmation}
        onCancel={() => this.setState({ unsubmitConfirmation: false })}
        onConfirm={() => {
          this.setState({ unsubmitConfirmation: false });
          handleUnsubmit();
        }}
      />
    );
  }

  render() {
    return (
      <Card style={styles.questionCardContainer}>
        <form>{this.renderQuestions()}</form>
        {this.renderGradingPanel()}
        {this.renderSaveDraftButton()}
        {this.renderSubmitButton()}
        {this.renderUnsubmitButton()}
        {this.renderPublishButton()}
        {this.renderSubmitDialog()}
        {this.renderUnsubmitDialog()}
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
  handleMark: PropTypes.func,
  handlePublish: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditForm);
