import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import { white, red100, red200, red900, green200, green500, green900,
  lightBlue400, blue800 } from 'material-ui/styles/colors';
import { Stepper, Step, StepButton, StepLabel } from 'material-ui/Stepper';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import SvgIcon from 'material-ui/SvgIcon';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { explanationShape, questionShape, historyQuestionShape, questionFlagsShape, topicShape } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import QuestionGrade from '../../containers/QuestionGrade';
import GradingPanel from '../../containers/GradingPanel';
import Comments from '../../containers/Comments';
import { formNames, questionTypes } from '../../constants';
import translations from '../../translations';
import submissionFormValidate from './submissionFormValidate';

const styles = {
  questionContainer: {
    marginTop: 20,
  },
  questionCardContainer: {
    padding: 40,
  },
  explanationContainer: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 5,
  },
  explanationHeader: {
    borderRadius: '5px 5px 0 0',
    padding: 12,
  },
  formButton: {
    marginBottom: 10,
    marginRight: 10,
  },
};

class SubmissionEditStepForm extends Component {
  static isLastQuestion(questionIds, stepIndex) {
    return stepIndex + 1 === questionIds.length;
  }

  constructor(props) {
    super(props);
    let initialStep = props.step || 0;
    initialStep = initialStep < 0 ? 0 : initialStep;
    initialStep = initialStep > props.maxStep ? props.maxStep : initialStep;

    this.state = {
      maxStep: props.maxStep,
      stepIndex: initialStep,
      submitConfirmation: false,
      unsubmitConfirmation: false,
      resetConfirmation: false,
    };
  }

  shouldRenderContinueButton() {
    const { stepIndex } = this.state;
    const { questionIds } = this.props;
    return !SubmissionEditStepForm.isLastQuestion(questionIds, stepIndex);
  }

  shouldDisableContinueButton() {
    const { stepIndex } = this.state;
    const { explanations, questionIds, isSaving } = this.props;
    const questionId = questionIds[stepIndex];

    if (isSaving) {
      return true;
    }

    if (explanations[questionId] && explanations[questionId].correct) {
      return false;
    }
    return true;
  }

  handleNext() {
    const { maxStep, stepIndex } = this.state;
    this.setState({
      maxStep: Math.max(maxStep, stepIndex + 1),
      stepIndex: stepIndex + 1,
    });
  }

  handleStepClick(index) {
    const { skippable, graderView } = this.props;
    const { maxStep } = this.state;

    if (skippable || graderView || index <= maxStep) {
      this.setState({
        stepIndex: index,
      });
    }
  }

  renderQuestionGrading(id) {
    const { attempting, published, graderView } = this.props;
    const editable = !attempting && graderView;
    const visible = editable || published;

    return visible ? <QuestionGrade id={id} editable={editable} /> : null;
  }

  renderGradingPanel() {
    const { attempting } = this.props;
    if (!attempting) {
      return <GradingPanel />;
    }
    return null;
  }

  renderExplanationPanel(question) {
    const { intl, explanations } = this.props;
    const explanation = explanations[question.id];

    if (explanation && explanation.correct !== null) {
      if (question.type === questionTypes.Programming && explanation.correct) {
        return null;
      }

      let title = '';
      if (explanation.correct) {
        if (question.autogradable) {
          title = intl.formatMessage(translations.correct);
        } else {
          title = intl.formatMessage(translations.answerSubmitted);
        }
      } else if (explanation.failureType === 'public_test') {
        title = intl.formatMessage(translations.publicTestCaseFailure);
      } else if (explanation.failureType === 'private_test') {
        title = intl.formatMessage(translations.privateTestCaseFailure);
      } else {
        title = intl.formatMessage(translations.wrong);
      }

      /* eslint-disable react/no-array-index-key */
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
          { explanation.explanations.every(exp => exp.trim().length === 0) ? null :
          <CardText>
            {explanation.explanations.map((exp, idx) => <div key={idx} dangerouslySetInnerHTML={{ __html: exp }} />)}
          </CardText> }
        </Card>
      );
      /* eslint-enable react/no-array-index-key */
    }
    return null;
  }

  renderAutogradingErrorPanel(id) {
    const { intl, questionsFlags, questions } = this.props;
    const { jobError } = questionsFlags[id] || {};
    const { type } = questions[id];

    if (type === questionTypes.Programming && jobError) {
      return (
        <Paper style={{ padding: 10, backgroundColor: red100, marginBottom: 20 }}>
          {intl.formatMessage(translations.autogradeFailure)}
        </Paper>
      );
    }

    return null;
  }

  renderResetButton() {
    const { stepIndex } = this.state;
    const { intl, questionIds, questions, questionsFlags, isSaving } = this.props;
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;
    const { isAutograding, isResetting } = questionsFlags[id] || {};

    if (question.type === questionTypes.Programming) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={white}
          label={intl.formatMessage(translations.reset)}
          onClick={() => this.setState({ resetConfirmation: true, resetAnswerId: answerId })}
          disabled={isAutograding || isResetting || isSaving}
        />
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { stepIndex } = this.state;
    const { intl, questionIds, questions, questionsFlags, handleSubmitAnswer, isSaving } = this.props;
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;
    const { isAutograding, isResetting } = questionsFlags[id] || {};
    return (
      <RaisedButton
        style={styles.formButton}
        secondary
        label={intl.formatMessage(translations.submit)}
        onClick={() => handleSubmitAnswer(answerId)}
        disabled={isAutograding || isResetting || isSaving}
      />
    );
  }

  renderContinueButton() {
    const { intl } = this.props;
    if (this.shouldRenderContinueButton()) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={green500}
          labelColor={white}
          label={intl.formatMessage(translations.continue)}
          onClick={() => this.handleNext()}
          disabled={this.shouldDisableContinueButton()}
        />
      );
    }
    return null;
  }

  renderAnswerLoadingIndicator() {
    const { stepIndex } = this.state;
    const { questionIds, questionsFlags } = this.props;
    const id = questionIds[stepIndex];
    const { isAutograding, isResetting } = questionsFlags[id] || {};

    if (isAutograding || isResetting) {
      return <CircularProgress size={36} style={{ position: 'absolute' }} />;
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
          onClick={handleSaveDraft}
          disabled={pristine || isSaving}
        />
      );
    }
    return null;
  }

  renderSaveGradeButton() {
    const { intl, graderView, attempting, handleSaveGrade } = this.props;
    if (graderView && !attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.saveGrade)}
          onClick={handleSaveGrade}
        />
      );
    }
    return null;
  }

  renderFinaliseButton() {
    const { intl, attempting, allCorrect, isSaving } = this.props;
    if (attempting && allCorrect) {
      return (
        <RaisedButton
          style={styles.formButton}
          secondary
          label={intl.formatMessage(translations.finalise)}
          onClick={() => this.setState({ submitConfirmation: true })}
          disabled={isSaving}
        />
      );
    }
    return null;
  }

  renderUnsubmitButton() {
    const { intl, graderView, attempting } = this.props;
    if (graderView && !attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label={intl.formatMessage(translations.unsubmit)}
          onClick={() => this.setState({ unsubmitConfirmation: true })}
        />
      );
    }
    return null;
  }

  renderStepQuestion() {
    const { stepIndex } = this.state;
    const {
      attempting, questionIds, questions, historyQuestions,
      topics, graderView, handleToggleViewHistoryMode, questionsFlags,
    } = this.props;
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId, topicId } = question;
    const topic = topics[topicId];
    return (
      <React.Fragment>
        <SubmissionAnswer
          {...{
            readOnly: !attempting,
            answerId,
            question,
            questionsFlags,
            historyQuestions,
            graderView,
            handleToggleViewHistoryMode,
          }}
        />
        {this.renderAutogradingErrorPanel(id)}
        {this.renderExplanationPanel(question)}
        {this.renderQuestionGrading(id)}
        {this.renderGradingPanel()}
        {attempting ?
          <div>
            {this.renderResetButton()}
            {this.renderSubmitButton()}
            {this.renderContinueButton()}
            {this.renderAnswerLoadingIndicator()}
          </div>
        : null}
        <div>
          {this.renderSaveGradeButton()}
          {this.renderSaveDraftButton()}
          {this.renderFinaliseButton()}
          {this.renderUnsubmitButton()}
        </div>
        <hr />
        <Comments topic={topic} />
      </React.Fragment>
    );
  }

  renderStepper() {
    const { maxStep, stepIndex } = this.state;
    const { skippable, graderView, questionIds = [] } = this.props;

    if (questionIds.length <= 1) {
      return null;
    }

    return (
      <Stepper
        activeStep={stepIndex}
        linear={false}
        connector={<div />}
        style={{ justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {questionIds.map((questionId, index) => {
          if (skippable || graderView || index <= maxStep) {
            return (
              <Step key={questionId} active={index <= maxStep}>
                <StepButton
                  iconContainerStyle={{ padding: 0 }}
                  icon={
                    <SvgIcon color={index === stepIndex ? blue800 : lightBlue400}>
                      <circle cx="12" cy="12" r="12" />
                      <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#fff">
                        {index + 1}
                      </text>
                    </SvgIcon>
                  }
                  onClick={() => this.handleStepClick(index)}
                />
              </Step>
            );
          }
          return (
            <Step key={questionId}>
              <StepLabel iconContainerStyle={{ padding: 0 }} />
            </Step>
          );
        })}
      </Stepper>
    );
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

  render() {
    return (
      <div style={styles.questionContainer}>
        {this.renderStepper()}
        <Card style={styles.questionCardContainer}>
          <form>{this.renderStepQuestion()}</form>
        </Card>
        {this.renderSubmitDialog()}
        {this.renderUnsubmitDialog()}
        {this.renderResetDialog()}
      </div>
    );
  }
}

SubmissionEditStepForm.propTypes = {
  intl: intlShape.isRequired,

  graderView: PropTypes.bool.isRequired,
  maxStep: PropTypes.number.isRequired,
  step: PropTypes.number,
  skippable: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

  explanations: PropTypes.objectOf(explanationShape),
  allCorrect: PropTypes.bool.isRequired,
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(questionShape),
  historyQuestions: PropTypes.objectOf(historyQuestionShape),
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  topics: PropTypes.objectOf(topicShape),
  isSaving: PropTypes.bool.isRequired,
  pristine: PropTypes.bool,

  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleSaveDraft: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleSubmitAnswer: PropTypes.func,
  handleReset: PropTypes.func,
  handleToggleViewHistoryMode: PropTypes.func,
};

export default reduxForm({
  form: formNames.SUBMISSION,
  validate: submissionFormValidate,
  destroyOnUnmount: false, // preserve form data after navigating to different step
})(injectIntl(SubmissionEditStepForm));
