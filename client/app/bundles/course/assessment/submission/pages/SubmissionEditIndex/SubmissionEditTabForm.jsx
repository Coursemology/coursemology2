import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { Tabs, Tab } from 'material-ui/Tabs';
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
import translations from '../../translations';

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
    const { submitted } = this.props;
    if (submitted) {
      return <QuestionGrade id={id} />;
    }
    return null;
  }

  renderProgrammingQuestionActions(id) {
    const { intl, submitted, questions, handleAutograde } = this.props;
    const question = questions[id];
    const { answerId } = question;

    if (submitted) {
      return null;
    }

    if (question.type === questionTypes.Programming) {
      return (
        <div>
          <RaisedButton
            style={styles.formButton}
            backgroundColor={white}
            label={intl.formatMessage(translations.reset)}
            onTouchTap={() => this.setState({ resetConfirmation: true, resetAnswerId: answerId })}
          />
          <RaisedButton
            style={styles.formButton}
            backgroundColor={red900}
            secondary
            label={intl.formatMessage(translations.submit)}
            onTouchTap={() => handleAutograde(answerId)}
          />
        </div>
      );
    }
    return null;
  }

  renderQuestions() {
    const { canGrade, submitted, questionIds, questions, topics } = this.props;
    return (
      <Tabs>
        {questionIds.map((id, index) => {
          const question = questions[id];
          const { answerId, topicId } = question;
          const topic = topics[topicId];
          return (
            <Tab key={id} label={index + 1}>
              <SubmissionAnswer {...{ canGrade, readOnly: submitted, answerId, question }} />
              {this.renderQuestionGrading(id)}
              {this.renderProgrammingQuestionActions(id)}
              <Comments topic={topic} />
            </Tab>
          );
        })}
      </Tabs>
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
    const { intl, pristine, submitting, attempting, handleSaveDraft } = this.props;
    if (attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.saveDraft)}
          onTouchTap={handleSaveDraft}
          disabled={pristine || submitting}
        />
      );
    }
    return null;
  }

  renderSaveGradeButton() {
    const { intl, canGrade, attempting, handleSaveGrade } = this.props;
    if (canGrade && !attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.saveGrade)}
          onTouchTap={handleSaveGrade}
        />
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { intl, canUpdate, submitting, attempting } = this.props;
    if (attempting && canUpdate) {
      return (
        <RaisedButton
          style={styles.formButton}
          secondary
          label={intl.formatMessage(translations.finalise)}
          onTouchTap={() => this.setState({ submitConfirmation: true })}
          disabled={submitting}
        />
      );
    }
    return null;
  }

  renderUnsubmitButton() {
    const { intl, canGrade, submitted, published } = this.props;
    if (canGrade && (submitted || published)) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label={intl.formatMessage(translations.unsubmit)}
          onTouchTap={() => this.setState({ unsubmitConfirmation: true })}
        />
      );
    }
    return null;
  }

  renderMarkButton() {
    const { intl, delayedGradePublication, canGrade, submitted, handleMark } = this.props;
    if (delayedGradePublication && canGrade && submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={yellow900}
          labelColor={white}
          label={intl.formatMessage(translations.mark)}
          onTouchTap={handleMark}
        />
      );
    }
    return null;
  }

  renderUnmarkButton() {
    const { intl, canGrade, graded, handleUnmark } = this.props;
    if (canGrade && graded) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={yellow900}
          labelColor={white}
          label={intl.formatMessage(translations.unmark)}
          onTouchTap={handleUnmark}
        />
      );
    }
    return null;
  }

  renderPublishButton() {
    const { intl, delayedGradePublication, canGrade, submitted, handlePublish } = this.props;
    if (!delayedGradePublication && canGrade && submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label={intl.formatMessage(translations.publish)}
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

  render() {
    return (
      <Card style={styles.questionContainer}>
        <form>{this.renderQuestions()}</form>
        <hr />
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

SubmissionEditTabForm.propTypes = {
  intl: intlShape.isRequired,

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
  delayedGradePublication: PropTypes.bool.isReqruied,

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
})(injectIntl(SubmissionEditTabForm));
