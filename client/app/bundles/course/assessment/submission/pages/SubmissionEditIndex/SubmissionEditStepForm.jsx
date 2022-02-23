import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { Prompt } from 'react-router-dom';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Hotkeys from 'react-hot-keys';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Paper,
  Step,
  Stepper,
  StepButton,
  StepLabel,
  SvgIcon,
  Tooltip,
} from '@material-ui/core';
import { blue, green, lightBlue, red } from '@material-ui/core/colors';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import {
  explanationShape,
  questionShape,
  historyQuestionShape,
  questionFlagsShape,
  topicShape,
} from '../../propTypes';
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
  contineButton: {
    backgroundColor: green[500],
    labelColor: 'white',
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

  componentDidMount() {
    window.addEventListener('beforeunload', this.handleUnload);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleUnload);
  }

  handleUnload = (e) => {
    if (!this.props.pristine) {
      e.preventDefault();
      // For Chrome to show warning when navigating away from the page, we need to
      // indicate the returnValue below.
      e.returnValue = '';
      return '';
    }
    return null;
  };

  handleNext() {
    const { maxStep, stepIndex } = this.state;
    this.setState({
      maxStep: Math.max(maxStep, stepIndex + 1),
      stepIndex: stepIndex + 1,
    });
  }

  handleStepClick(index) {
    const { published, skippable, graderView } = this.props;
    const { maxStep } = this.state;

    if (published || skippable || graderView || index <= maxStep) {
      this.setState({
        stepIndex: index,
      });
    }
  }

  shouldRenderContinueButton() {
    const { stepIndex } = this.state;
    const { questionIds } = this.props;
    return !SubmissionEditStepForm.isLastQuestion(questionIds, stepIndex);
  }

  shouldDisableContinueButton() {
    const { stepIndex } = this.state;
    const { explanations, questionIds, isSaving, showMcqAnswer } = this.props;
    const questionId = questionIds[stepIndex];

    if (isSaving) {
      return true;
    }

    if (explanations[questionId] && explanations[questionId].correct) {
      return false;
    }

    return showMcqAnswer;
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
              color: explanation.correct ? green[900] : red[900],
              backgroundColor: explanation.correct ? green[200] : red[200],
            }}
            title={title}
            titleTypographyProps={{ variant: 'body2' }}
          />
          {explanation.explanations.every(
            (exp) => exp.trim().length === 0,
          ) ? null : (
            <CardContent>
              {explanation.explanations.map((exp, idx) => (
                <div key={idx} dangerouslySetInnerHTML={{ __html: exp }} />
              ))}
            </CardContent>
          )}
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
        <Paper
          style={{ padding: 10, backgroundColor: red[100], marginBottom: 20 }}
        >
          {intl.formatMessage(translations.autogradeFailure)}
        </Paper>
      );
    }

    return null;
  }

  renderResetButton() {
    const { stepIndex } = this.state;
    const { intl, questionIds, questions, questionsFlags, isSaving } =
      this.props;
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;
    const { isAutograding, isResetting } = questionsFlags[id] || {};

    if (question.type === questionTypes.Programming) {
      return (
        <Button
          variant="contained"
          disabled={isAutograding || isResetting || isSaving}
          onClick={() =>
            this.setState({
              resetConfirmation: true,
              resetAnswerId: answerId,
            })
          }
          style={styles.formButton}
        >
          {intl.formatMessage(translations.reset)}
        </Button>
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { stepIndex } = this.state;
    const {
      intl,
      questionIds,
      questions,
      questionsFlags,
      handleSubmitAnswer,
      isSaving,
      showMcqAnswer,
    } = this.props;
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;
    const { isAutograding, isResetting } = questionsFlags[id] || {};
    if (
      [questionTypes.MultipleChoice, questionTypes.MultipleResponse].includes(
        question.type,
      ) &&
      question.autogradable &&
      !showMcqAnswer
    ) {
      return null;
    }
    return (
      <>
        <Hotkeys
          keyName="command+enter,control+enter"
          onKeyDown={() => handleSubmitAnswer(answerId)}
          disabled={isAutograding || isResetting || isSaving}
          filter={() => true}
        />
        <Tooltip title={<FormattedMessage {...translations.submitTooltip} />}>
          <Button
            variant="contained"
            color="secondary"
            disabled={isAutograding || isResetting || isSaving}
            onClick={() => handleSubmitAnswer(answerId)}
            style={styles.formButton}
          >
            {intl.formatMessage(translations.submit)}
          </Button>
        </Tooltip>
      </>
    );
  }

  renderContinueButton() {
    const { intl } = this.props;
    if (this.shouldRenderContinueButton()) {
      return (
        <Button
          variant="contained"
          disabled={this.shouldDisableContinueButton()}
          onClick={() => this.handleNext()}
          style={{
            ...styles.formButton,
            backgroundColor: green[500],
            color: 'white',
          }}
        >
          {intl.formatMessage(translations.continue)}
        </Button>
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
    const { intl, pristine, attempting, handleSaveDraft, isSaving } =
      this.props;
    if (attempting) {
      return (
        <Button
          variant="contained"
          color="primary"
          disabled={pristine || isSaving}
          onClick={handleSaveDraft}
          style={styles.formButton}
        >
          {intl.formatMessage(translations.saveDraft)}
        </Button>
      );
    }
    return null;
  }

  renderSaveGradeButton() {
    const { intl, graderView, attempting, handleSaveGrade } = this.props;
    if (graderView && !attempting) {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveGrade}
          style={styles.formButton}
        >
          {intl.formatMessage(translations.saveGrade)}
        </Button>
      );
    }
    return null;
  }

  renderFinaliseButton() {
    const {
      intl,
      attempting,
      allConsideredCorrect,
      isSaving,
      allowPartialSubmission,
    } = this.props;
    if (attempting && (allowPartialSubmission || allConsideredCorrect)) {
      return (
        <Button
          variant="contained"
          color="secondary"
          disabled={isSaving}
          onClick={() => this.setState({ submitConfirmation: true })}
          style={styles.formButton}
        >
          {intl.formatMessage(translations.finalise)}
        </Button>
      );
    }
    return null;
  }

  renderUnsubmitButton() {
    const { intl, graderView, attempting } = this.props;
    if (graderView && !attempting) {
      return (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => this.setState({ unsubmitConfirmation: true })}
          style={styles.formButton}
        >
          {intl.formatMessage(translations.unsubmit)}
        </Button>
      );
    }
    return null;
  }

  renderStepQuestion() {
    const { stepIndex } = this.state;
    const {
      attempting,
      questionIds,
      questions,
      historyQuestions,
      topics,
      graderView,
      showMcqMrqSolution,
      handleToggleViewHistoryMode,
      questionsFlags,
    } = this.props;
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId, topicId } = question;
    const topic = topics[topicId];
    return (
      <>
        <SubmissionAnswer
          {...{
            readOnly: !attempting,
            answerId,
            question,
            questionsFlags,
            historyQuestions,
            graderView,
            showMcqMrqSolution,
            handleToggleViewHistoryMode,
          }}
        />
        {this.renderAutogradingErrorPanel(id)}
        {this.renderExplanationPanel(question)}
        {this.renderQuestionGrading(id)}
        {this.renderGradingPanel()}
        {attempting ? (
          <div>
            {this.renderResetButton()}
            {this.renderSubmitButton()}
            {this.renderContinueButton()}
            {this.renderAnswerLoadingIndicator()}
          </div>
        ) : null}
        <div>
          {this.renderSaveGradeButton()}
          {this.renderSaveDraftButton()}
          {this.renderFinaliseButton()}
          {this.renderUnsubmitButton()}
        </div>
        <hr />
        <Comments topic={topic} />
      </>
    );
  }

  renderStepper() {
    const { maxStep, stepIndex } = this.state;
    const {
      published,
      skippable,
      graderView,
      questionIds = [],
      explanations,
    } = this.props;

    if (questionIds.length <= 1) {
      return null;
    }

    return (
      <Stepper
        activeStep={stepIndex}
        connector={<div />}
        nonLinear
        style={{ justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {questionIds.map((questionId, index) => {
          let stepButtonColor = '';
          const isCurrentQuestion = index === stepIndex;
          if (explanations[questionId] && explanations[questionId].correct) {
            stepButtonColor = isCurrentQuestion ? green[700] : green[300];
          } else {
            stepButtonColor = isCurrentQuestion ? blue[800] : lightBlue[400];
          }
          if (published || skippable || graderView || index <= maxStep) {
            return (
              <Step key={questionId} active={index <= maxStep}>
                <StepButton
                  icon={
                    <SvgIcon htmlColor={stepButtonColor}>
                      <circle cx="12" cy="12" r="12" />
                      <text
                        x="12"
                        y="16"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#fff"
                      >
                        {index + 1}
                      </text>
                    </SvgIcon>
                  }
                  onClick={() => this.handleStepClick(index)}
                  style={styles.stepButton}
                />
              </Step>
            );
          }
          return (
            <Step key={questionId}>
              <StepLabel />
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
        onCancel={() =>
          this.setState({ resetConfirmation: false, resetAnswerId: null })
        }
        onConfirm={() => {
          this.setState({ resetConfirmation: false, resetAnswerId: null });
          handleReset(resetAnswerId);
        }}
        message={intl.formatMessage(translations.resetConfirmation)}
      />
    );
  }

  renderNavigateAwayWarning() {
    const isDirty = !this.props.pristine;
    return (
      <Prompt
        when={isDirty}
        message={(action) =>
          // Note: POP refers to back action in a browser.
          action === 'POP'
        }
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

        {this.renderNavigateAwayWarning()}
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

  showMcqMrqSolution: PropTypes.bool.isRequired,

  explanations: PropTypes.objectOf(explanationShape),
  allConsideredCorrect: PropTypes.bool.isRequired,
  allowPartialSubmission: PropTypes.bool.isRequired,
  showMcqAnswer: PropTypes.bool.isRequired,
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
