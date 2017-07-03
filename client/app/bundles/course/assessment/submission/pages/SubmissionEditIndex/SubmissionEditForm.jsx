import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { red900, yellow900, white } from 'material-ui/styles/colors';

import { QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import QuestionGrade from '../../containers/QuestionGrade';
import GradingPanel from '../../containers/GradingPanel';
import Comments from '../../containers/Comments';
import SubmitDialog from '../../components/SubmitDialog';
import UnsubmitDialog from '../../components/UnsubmitDialog';
import ResetDialog from '../../components/ResetDialog';
import { questionTypes } from '../../constants';

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
      resetConfirmation: false,
      resetAnswerId: null,
    };
  }

  renderQuestionGrading(id) {
    const { attempting } = this.props;
    if (!attempting) {
      return <QuestionGrade id={id} />;
    }
    return null;
  }

  renderProgrammingQuestionActions(id) {
    const { attempting, questions, handleAutograde } = this.props;
    const question = questions[id];
    const { answerId } = question;

    if (!attempting) {
      return null;
    }

    if (question.type === questionTypes.Programming) {
      return (
        <div>
          <RaisedButton
            style={styles.formButton}
            backgroundColor={white}
            label="Reset Answer"
            onTouchTap={() => this.setState({ resetConfirmation: true, resetAnswerId: answerId })}
          />
          <RaisedButton
            style={styles.formButton}
            backgroundColor={red900}
            secondary
            label="Submit"
            onTouchTap={() => handleAutograde(answerId)}
          />
        </div>
      );
    }
    return null;
  }

  renderQuestions() {
    const { canGrade, attempting, questionIds, questions, topics } = this.props;
    return (
      <div>
        {questionIds.map((id) => {
          const question = questions[id];
          const { answerId, topicId } = question;
          const topic = topics[topicId];
          return (
            <div key={id} style={styles.questionContainer}>
              <SubmissionAnswer {...{ canGrade, readOnly: !attempting, answerId, question }} />
              {this.renderQuestionGrading(id)}
              {this.renderProgrammingQuestionActions(id)}
              <Comments topic={topic} />
              <hr />
            </div>
          );
        })}
      </div>
    );
  }

  renderGradingPanel() {
    const { attempting } = this.props;
    if (!attempting) {
      return <GradingPanel />;
    }
    return null;
  }

  renderSaveDraftButton() {
    const { pristine, submitting, attempting, handleSaveDraft } = this.props;
    if (attempting) {
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

  renderSaveGradeButton() {
    const { canGrade, attempting, handleSaveGrade } = this.props;
    if (canGrade && !attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label="Save"
          onTouchTap={handleSaveGrade}
        />
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { canUpdate, submitting, attempting } = this.props;
    if (attempting && canUpdate) {
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
    const { canGrade, submitted, published } = this.props;
    if (canGrade && (submitted || published)) {
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

  renderMarkButton() {
    const { delayedGradePublication, canGrade, submitted, handleMark } = this.props;
    if (delayedGradePublication && canGrade && submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={yellow900}
          labelColor={white}
          label="Submit For Publishing"
          onTouchTap={handleMark}
        />
      );
    }
    return null;
  }

  renderUnmarkButton() {
    const { canGrade, graded, handleUnmark } = this.props;
    if (canGrade && graded) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={yellow900}
          labelColor={white}
          label="Revert to Submitted"
          onTouchTap={handleUnmark}
        />
      );
    }
    return null;
  }

  renderPublishButton() {
    const { delayedGradePublication, canGrade, submitted, handlePublish } = this.props;
    if (!delayedGradePublication && canGrade && submitted) {
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

  renderResetDialog() {
    const { resetConfirmation, resetAnswerId } = this.state;
    const { handleReset } = this.props;
    return (
      <ResetDialog
        open={resetConfirmation}
        onCancel={() => this.setState({ resetConfirmation: false, resetAnswerId: null })}
        onConfirm={() => {
          this.setState({ resetConfirmation: false, resetAnswerId: null });
          handleReset(resetAnswerId);
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
        {this.renderSaveGradeButton()}
        {this.renderSubmitButton()}
        {this.renderUnsubmitButton()}
        {this.renderMarkButton()}
        {this.renderUnmarkButton()}
        {this.renderPublishButton()}

        {this.renderSubmitDialog()}
        {this.renderUnsubmitDialog()}
        {this.renderResetDialog()}
      </Card>
    );
  }
}

SubmissionEditForm.propTypes = {
  canGrade: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  graded: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(QuestionProp),
  topics: PropTypes.objectOf(TopicProp),
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  delayedGradePublication: PropTypes.bool.isRequired,

  handleSaveDraft: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleAutograde: PropTypes.func,
  handleReset: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleMark: PropTypes.func,
  handleUnmark: PropTypes.func,
  handlePublish: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditForm);
