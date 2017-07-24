/* eslint-disable react/no-danger */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import { red100, red200, red900, yellow900,
         green200, green900, grey100, white } from 'material-ui/styles/colors';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { ExplanationProp, QuestionProp, QuestionFlagsProp,
        QuestionGradeProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import QuestionGrade from '../../containers/QuestionGrade';
import GradingPanel from '../../containers/GradingPanel';
import Comments from '../../containers/Comments';
import { formNames, questionTypes } from '../../constants';
import translations from '../../translations';

const styles = {
  questionCardContainer: {
    marginTop: 20,
    padding: 40,
  },
  explanationContainer: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 5,
  },
  questionContainer: {
    paddingTop: 10,
  },
  formButton: {
    marginBottom: 10,
    marginRight: 10,
  },
};

class SubmissionEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      examNotice: props.newSubmission && props.passwordProtected,
      submitConfirmation: false,
      unsubmitConfirmation: false,
      resetConfirmation: false,
      resetAnswerId: null,
    };
  }

  renderQuestionGrading(id) {
    const { attempting, published, canGrade } = this.props;
    const editable = !attempting && canGrade;
    const visible = editable || published;

    return visible ? <QuestionGrade id={id} editable={editable} /> : null;
  }

  renderProgrammingQuestionActions(id) {
    const { intl, attempting, canGrade, questions, questionsFlags,
            handleAutograde, isSaving } = this.props;
    const question = questions[id];
    const { answerId, attemptsLeft, attemptLimit, autogradable } = question;
    const { hasError, isAutograding, isResetting } = questionsFlags[id] || {};

    if (!attempting) {
      return null;
    }

    if (question.type === questionTypes.Programming) {
      const runCodeLabel = attemptLimit ?
        intl.formatMessage(translations.runCodeWithLimit, { attemptsLeft }) :
        intl.formatMessage(translations.runCode);

      return (
        <div>
          {hasError ? <Paper style={{ padding: 10, backgroundColor: red100, marginBottom: 20 }}>
            {intl.formatMessage(translations.autogradeFailure)}
          </Paper> : null}
          <RaisedButton
            style={styles.formButton}
            backgroundColor={white}
            label={intl.formatMessage(translations.reset)}
            onTouchTap={() => this.setState({ resetConfirmation: true, resetAnswerId: answerId })}
            disabled={isAutograding || isResetting || isSaving}
          />
          {autogradable ? <RaisedButton
            style={styles.formButton}
            backgroundColor={red900}
            secondary
            label={runCodeLabel}
            onTouchTap={() => handleAutograde(answerId)}
            disabled={isAutograding || isResetting || isSaving || (!canGrade && attemptsLeft === 0)}
          /> : null}
          {isAutograding || isResetting ? <CircularProgress size={36} style={{ position: 'absolute' }} /> : null}
        </div>
      );
    }
    return null;
  }

  renderExplanationPanel(questionId) {
    const { intl, explanations, attempting } = this.props;
    const explanation = explanations[questionId];

    if (explanation && explanation.correct === false && attempting) {
      let title = '';
      if (explanation.failureType === 'public_test') {
        title = intl.formatMessage(translations.publicTestCaseFailure);
      } else if (explanation.failureType === 'private_test') {
        title = intl.formatMessage(translations.privateTestCaseFailure);
      } else {
        title = intl.formatMessage(translations.wrong);
      }

      return (
        <Card style={styles.explanationContainer}>
          <CardHeader
            style={{
              ...styles.explanationHeader,
              backgroundColor: explanation.correct ? green200 : red200,
            }}
            title={title}
            titleColor={explanation.correct ? green900 : red900}
          />
          <CardText>
            {explanation.explanations.map(exp => <div dangerouslySetInnerHTML={{ __html: exp }} />)}
          </CardText>
        </Card>
      );
    }
    return null;
  }

  renderTabbedQuestions() {
    const { intl, attempting, questionIds, questions, topics } = this.props;
    return (
      <Tabs>
        {questionIds.map((id, index) => {
          const question = questions[id];
          const { answerId, topicId } = question;
          const topic = topics[topicId];
          return (
            <Tab key={id} label={intl.formatMessage(translations.questionNumber, { number: index + 1 })}>
              <SubmissionAnswer {...{ readOnly: !attempting, answerId, question }} />
              {question.type === questionTypes.Programming ? this.renderExplanationPanel(id) : null}
              {this.renderQuestionGrading(id)}
              {this.renderProgrammingQuestionActions(id)}
              <Comments topic={topic} />
              <hr />
            </Tab>
          );
        })}
      </Tabs>
    );
  }

  renderQuestions() {
    const { attempting, questionIds, questions, topics } = this.props;
    return (
      <div>
        {questionIds.map((id) => {
          const question = questions[id];
          const { answerId, topicId } = question;
          const topic = topics[topicId];
          return (
            <div key={id} style={styles.questionContainer}>
              <SubmissionAnswer {...{ readOnly: !attempting, answerId, question }} />
              {question.type === questionTypes.Programming ? this.renderExplanationPanel(id) : null}
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
    const { intl, pristine, attempting, handleSaveDraft, isSaving } = this.props;
    if (attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.saveDraft)}
          onTouchTap={handleSaveDraft}
          disabled={pristine || isSaving}
        />
      );
    }
    return null;
  }

  renderSaveGradeButton() {
    const { intl, canGrade, attempting, handleSaveGrade, isSaving } = this.props;
    if (canGrade && !attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.saveGrade)}
          onTouchTap={handleSaveGrade}
          disabled={isSaving}
        />
      );
    }
    return null;
  }

  renderAutogradeSubmissionButton() {
    const { intl, canGrade, submitted, handleAutogradeSubmission,
            isAutograding, isSaving } = this.props;
    if (canGrade && submitted) {
      const progressIcon = <CircularProgress size={24} />;

      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.autograde)}
          icon={isAutograding ? progressIcon : null}
          onTouchTap={handleAutogradeSubmission}
          disabled={isSaving || isAutograding}
        />
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { intl, canUpdate, attempting, isSaving } = this.props;
    if (attempting && canUpdate) {
      return (
        <RaisedButton
          style={styles.formButton}
          secondary
          label={intl.formatMessage(translations.finalise)}
          onTouchTap={() => this.setState({ submitConfirmation: true })}
          disabled={isSaving}
        />
      );
    }
    return null;
  }

  renderUnsubmitButton() {
    const { intl, canGrade, submitted, published, isSaving } = this.props;
    if (canGrade && (submitted || published)) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label={intl.formatMessage(translations.unsubmit)}
          onTouchTap={() => this.setState({ unsubmitConfirmation: true })}
          disabled={isSaving}
        />
      );
    }
    return null;
  }

  renderMarkButton() {
    const { intl, delayedGradePublication, grading,
            canGrade, submitted, handleMark, isSaving } = this.props;
    if (delayedGradePublication && canGrade && submitted) {
      const anyUngraded = Object.values(grading).some(
        q => q.grade === undefined || q.grade === null);
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={yellow900}
          labelColor={white}
          label={intl.formatMessage(translations.mark)}
          onTouchTap={handleMark}
          disabled={isSaving || anyUngraded}
        />
      );
    }
    return null;
  }

  renderUnmarkButton() {
    const { intl, canGrade, graded, handleUnmark, isSaving } = this.props;
    if (canGrade && graded) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={yellow900}
          labelColor={white}
          label={intl.formatMessage(translations.unmark)}
          onTouchTap={handleUnmark}
          disabled={isSaving}
        />
      );
    }
    return null;
  }

  renderPublishButton() {
    const { intl, delayedGradePublication, canGrade, grading,
            submitted, handlePublish, isSaving } = this.props;
    if (!delayedGradePublication && canGrade && submitted) {
      const anyUngraded = Object.values(grading).some(
        q => q.grade === undefined || q.grade === null);

      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label={intl.formatMessage(translations.publish)}
          onTouchTap={handlePublish}
          disabled={isSaving || anyUngraded}
        />
      );
    }
    return null;
  }

  renderSubmitDialog() {
    const { submitConfirmation } = this.state;
    const { intl, handleSubmit } = this.props;
    return (
      <ConfirmationDialog
        open={submitConfirmation}
        onCancel={() => this.setState({ submitConfirmation: false })}
        onConfirm={() => {
          this.setState({ submitConfirmation: false });
          handleSubmit();
        }}
        message={intl.formatMessage(translations.submitConfirmation)}
      />
    );
  }

  renderUnsubmitDialog() {
    const { unsubmitConfirmation } = this.state;
    const { intl, handleUnsubmit } = this.props;
    return (
      <ConfirmationDialog
        open={unsubmitConfirmation}
        onCancel={() => this.setState({ unsubmitConfirmation: false })}
        onConfirm={() => {
          this.setState({ unsubmitConfirmation: false });
          handleUnsubmit();
        }}
        message={intl.formatMessage(translations.unsubmitConfirmation)}
      />
    );
  }

  renderResetDialog() {
    const { resetConfirmation, resetAnswerId } = this.state;
    const { intl, handleReset } = this.props;
    return (
      <ConfirmationDialog
        open={resetConfirmation}
        onCancel={() => this.setState({ resetConfirmation: false, resetAnswerId: null })}
        onConfirm={() => {
          this.setState({ resetConfirmation: false, resetAnswerId: null });
          handleReset(resetAnswerId);
        }}
        message={intl.formatMessage(translations.resetConfirmation)}
      />
    );
  }

  renderExamDialog() {
    const { intl } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(translations.examDialogTitle)}
        actions={
          <FlatButton
            primary
            label="OK"
            onTouchTap={() => this.setState({ examNotice: false })}
          />
        }
        modal
        open={this.state.examNotice}
      >
        {intl.formatMessage(translations.examDialogMessage)}
      </Dialog>
    );
  }

  render() {
    const { tabbedView } = this.props;
    return (
      <Card style={styles.questionCardContainer}>
        <form>{tabbedView ? this.renderTabbedQuestions() : this.renderQuestions()}</form>
        {this.renderGradingPanel()}

        {this.renderSaveDraftButton()}
        {this.renderSaveGradeButton()}
        {this.renderAutogradeSubmissionButton()}
        {this.renderSubmitButton()}
        {this.renderUnsubmitButton()}
        {this.renderMarkButton()}
        {this.renderUnmarkButton()}
        {this.renderPublishButton()}

        {this.renderSubmitDialog()}
        {this.renderUnsubmitDialog()}
        {this.renderResetDialog()}
        {this.renderExamDialog()}
      </Card>
    );
  }
}

SubmissionEditForm.propTypes = {
  intl: intlShape.isRequired,

  canGrade: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  delayedGradePublication: PropTypes.bool.isRequired,
  newSubmission: PropTypes.bool.isRequired,
  passwordProtected: PropTypes.bool.isRequired,
  tabbedView: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  graded: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

  explanations: PropTypes.objectOf(ExplanationProp),
  grading: PropTypes.objectOf(QuestionGradeProp),
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(QuestionProp),
  questionsFlags: PropTypes.objectOf(QuestionFlagsProp),
  topics: PropTypes.objectOf(TopicProp),
  isAutograding: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  pristine: PropTypes.bool,

  handleAutogradeSubmission: PropTypes.func,
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
  form: formNames.SUBMISSION,
})(injectIntl(SubmissionEditForm));
