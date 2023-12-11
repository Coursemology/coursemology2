import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Hotkeys from 'react-hot-keys';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Paper,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material';
import { blue, green, lightBlue, red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import ErrorText from 'lib/components/core/ErrorText';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import usePrompt from 'lib/hooks/router/usePrompt';

import EvaluatorErrorPanel from '../../components/EvaluatorErrorPanel';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import { formNames, questionTypes } from '../../constants';
import Comments from '../../containers/Comments';
import GradingPanel from '../../containers/GradingPanel';
import QuestionGrade from '../../containers/QuestionGrade';
import {
  explanationShape,
  historyQuestionShape,
  questionFlagsShape,
  questionShape,
  topicShape,
} from '../../propTypes';
import translations from '../../translations';

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
    color: 'white',
    marginBottom: 10,
    marginRight: 10,
  },
  stepButton: {
    margin: '-24px -16px',
    padding: '24px 16px',
  },
};

const isLastQuestion = (questionIds, stepIndex) =>
  stepIndex + 1 === questionIds.length;

const SubmissionEditStepForm = (props) => {
  const {
    allConsideredCorrect,
    allowPartialSubmission,
    attempting,
    codaveriFeedbackStatus,
    explanations,
    graderView,
    isCodaveriEnabled,
    onReset,
    onSaveAnswer,
    onSaveDraft,
    onSubmit,
    onSubmitAnswer,
    onGenerateFeedback,
    onReevaluateAnswer,
    handleSaveAllGrades,
    handleSaveGrade,
    handleToggleViewHistoryMode,
    handleUnsubmit,
    historyQuestions,
    initialValues,
    intl,
    isSaving,
    maxStep: maxInitialStep,
    published,
    questionIds,
    questions,
    questionsFlags,
    savingStatus,
    showMcqAnswer,
    showMcqMrqSolution,
    skippable,
    step,
    topics,
  } = props;

  const initialStep = Math.min(maxInitialStep, Math.max(0, step || 0));

  const [submitConfirmation, setSubmitConfirmation] = useState(false);
  const [unsubmitConfirmation, setUnsubmitConfirmation] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState(false);
  const [resetAnswerId, setResetAnswerId] = useState(null);
  const [maxStep, setMaxStep] = useState(maxInitialStep);
  const [stepIndex, setStepIndex] = useState(initialStep);

  const methods = useForm({
    defaultValues: initialValues,
  });

  const {
    getValues,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = methods;
  usePrompt(isDirty);

  useEffect(() => {
    reset(initialValues);
  }, [initialValues]);

  const handleNext = () => {
    setMaxStep(Math.max(maxStep, stepIndex + 1));
    setStepIndex(stepIndex + 1);
  };

  const handleStepClick = (index) => {
    if (published || skippable || graderView || index <= maxStep) {
      setStepIndex(index);
    }
  };

  const shouldDisableContinueButton = () => {
    const questionId = questionIds[stepIndex];

    if (isSaving) {
      return true;
    }

    if (explanations[questionId] && explanations[questionId].correct) {
      return false;
    }

    return showMcqAnswer;
  };

  const shouldRenderContinueButton = () =>
    !isLastQuestion(questionIds, stepIndex);

  const renderAnswerLoadingIndicator = () => {
    const id = questionIds[stepIndex];
    const { isAutograding, isResetting } = questionsFlags[id] || {};

    if (isAutograding || isResetting) {
      return <CircularProgress size={36} style={{ position: 'absolute' }} />;
    }
    return null;
  };

  const renderAutogradingErrorPanel = (id) => {
    const { jobError, jobErrorMessage } = questionsFlags[id] || {};
    const { isCodaveri, type } = questions[id];

    if (type === questionTypes.Programming && jobError) {
      return (
        <EvaluatorErrorPanel className="mb-8">
          {isCodaveri
            ? intl.formatMessage(translations.codaveriAutogradeFailure)
            : jobErrorMessage}
        </EvaluatorErrorPanel>
      );
    }

    return null;
  };

  const renderContinueButton = () => {
    const disabled = shouldDisableContinueButton();
    if (!shouldRenderContinueButton()) {
      return null;
    }
    return (
      <Button
        disabled={disabled}
        onClick={() => handleNext()}
        style={{
          ...styles.formButton,
          ...(!disabled && styles.contineButton),
        }}
        variant="contained"
      >
        {intl.formatMessage(translations.continue)}
      </Button>
    );
  };

  const renderExplanationPanel = (question) => {
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
                <Typography
                  key={idx}
                  dangerouslySetInnerHTML={{ __html: exp }}
                  variant="body2"
                />
              ))}
            </CardContent>
          )}
        </Card>
      );
      /* eslint-enable react/no-array-index-key */
    }
    return null;
  };

  const renderFinaliseButton = () => {
    if (attempting && (allowPartialSubmission || allConsideredCorrect)) {
      return (
        <Button
          color="secondary"
          disabled={isSaving}
          onClick={() => setSubmitConfirmation(true)}
          style={styles.formButton}
          variant="contained"
        >
          {intl.formatMessage(translations.finalise)}
        </Button>
      );
    }
    return null;
  };

  const renderGradingPanel = () => {
    if (attempting) {
      return null;
    }
    return <GradingPanel />;
  };

  const renderQuestionGrading = (id) => {
    const editable = !attempting && graderView;
    const visible = editable || published;

    return visible ? (
      <QuestionGrade
        editable={editable}
        handleSaveGrade={handleSaveGrade}
        isSaving={isSaving}
        questionId={id}
      />
    ) : null;
  };

  const renderReevaluateButton = () => {
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;
    const { isAutograding } = questionsFlags[id] || {};
    if (question.type !== questionTypes.Programming) {
      return null;
    }

    return (
      <>
        {isCodaveriEnabled && question.isCodaveri && (
          <Button
            color="secondary"
            disabled={
              codaveriFeedbackStatus?.answers[answerId]?.jobStatus ===
                'submitted' || isSaving
            }
            id="retrieve-code-feedback"
            onClick={() => onGenerateFeedback(answerId, question.id)}
            style={styles.formButton}
            variant="contained"
          >
            {intl.formatMessage(translations.generateCodaveriFeedback)}
          </Button>
        )}
        <Button
          color="secondary"
          disabled={isAutograding || isSaving}
          endIcon={isAutograding && <LoadingIndicator bare size={20} />}
          id="re-evaluate-code"
          onClick={() => onReevaluateAnswer(answerId, question.id)}
          style={styles.formButton}
          variant="contained"
        >
          {intl.formatMessage(translations.reevaluate)}
        </Button>
      </>
    );
  };

  const renderResetButton = () => {
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;
    const { isAutograding, isResetting } = questionsFlags[id] || {};

    if (question.type === questionTypes.Programming) {
      return (
        <Button
          color="info"
          disabled={isAutograding || isResetting || isSaving}
          onClick={() => {
            setResetConfirmation(true);
            setResetAnswerId(answerId);
          }}
          style={styles.formButton}
          variant="outlined"
        >
          {intl.formatMessage(translations.reset)}
        </Button>
      );
    }
    return null;
  };

  const renderResetDialog = () => (
    <ConfirmationDialog
      message={intl.formatMessage(translations.resetConfirmation)}
      onCancel={() => {
        setResetConfirmation(false);
        setResetAnswerId(null);
      }}
      onConfirm={() => {
        setResetConfirmation(false);
        setResetAnswerId(null);
        onReset(resetAnswerId, setValue);
      }}
      open={resetConfirmation}
    />
  );

  const renderSaveDraftButton = () => {
    if (!attempting) {
      return null;
    }
    return (
      <Button
        color="primary"
        disabled={!isDirty || isSaving}
        onClick={handleSubmit((data) => onSaveDraft({ ...data }))}
        style={styles.formButton}
        variant="contained"
      >
        {intl.formatMessage(translations.saveDraft)}
      </Button>
    );
  };

  const renderSaveGradeButton = () => {
    const shouldRenderSaveGradeButton = graderView && !attempting;
    if (!shouldRenderSaveGradeButton) {
      return null;
    }
    return (
      <Button
        color="primary"
        disabled={isSaving}
        onClick={handleSaveAllGrades}
        style={styles.formButton}
        variant="contained"
      >
        {intl.formatMessage(translations.saveGrade)}
      </Button>
    );
  };

  const renderSubmitButton = () => {
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
          disabled={isAutograding || isResetting || isSaving}
          filter={() => true}
          keyName="command+enter,control+enter"
          onKeyDown={() =>
            onSubmitAnswer(answerId, getValues(`${answerId}`), setValue)
          }
        />
        <Tooltip title={<FormattedMessage {...translations.submitTooltip} />}>
          <Button
            color="secondary"
            disabled={isAutograding || isResetting || isSaving}
            endIcon={isAutograding && <LoadingIndicator bare size={20} />}
            onClick={() =>
              onSubmitAnswer(answerId, getValues(`${answerId}`), setValue)
            }
            style={styles.formButton}
            variant="contained"
          >
            {intl.formatMessage(translations.submit)}
          </Button>
        </Tooltip>
      </>
    );
  };

  const renderSubmitDialog = () => (
    <ConfirmationDialog
      form={formNames.SUBMISSION}
      message={intl.formatMessage(translations.submitConfirmation)}
      onCancel={() => setSubmitConfirmation(false)}
      onConfirm={() => setSubmitConfirmation(false)}
      open={submitConfirmation}
    />
  );

  const renderUnsubmitButton = () => {
    const shouldRenderUnsubmitButton = graderView && !attempting;
    if (!shouldRenderUnsubmitButton) {
      return null;
    }
    return (
      <Button
        color="secondary"
        disabled={isSaving}
        onClick={() => setUnsubmitConfirmation(true)}
        style={styles.formButton}
        variant="contained"
      >
        {intl.formatMessage(translations.unsubmit)}
      </Button>
    );
  };

  const renderUnsubmitDialog = () => (
    <ConfirmationDialog
      message={intl.formatMessage(translations.unsubmitConfirmation)}
      onCancel={() => setUnsubmitConfirmation(false)}
      onConfirm={() => {
        setUnsubmitConfirmation(false);
        handleUnsubmit();
      }}
      open={unsubmitConfirmation}
    />
  );

  const renderStepQuestion = () => {
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
            historyQuestions,
            graderView,
            showMcqMrqSolution,
            handleToggleViewHistoryMode,
            savingStatus,
            onSaveAnswer,
          }}
        />
        {renderAutogradingErrorPanel(id)}
        {renderExplanationPanel(question)}
        {!attempting && graderView ? renderReevaluateButton() : null}
        {renderQuestionGrading(id)}

        {attempting ? (
          <div>
            {renderResetButton()}
            {renderSubmitButton()}
            {renderContinueButton()}
            {renderAnswerLoadingIndicator()}
          </div>
        ) : null}

        <Comments topic={topic} />
      </>
    );
  };

  const renderStepperIcon = (questionId, questionIndex) => {
    let stepButtonColor = '';
    const isCurrentQuestion = questionIndex === stepIndex;
    if (explanations[questionId]?.correct) {
      stepButtonColor = isCurrentQuestion ? green[700] : green[300];
    } else if (explanations[questionId]?.correct === false) {
      stepButtonColor = isCurrentQuestion ? red[700] : red[300];
    } else {
      stepButtonColor = isCurrentQuestion ? blue[800] : lightBlue[400];
    }
    return (
      <SvgIcon htmlColor={stepButtonColor}>
        <circle cx="12" cy="12" r="12" />
        <text fill="#fff" fontSize="12" textAnchor="middle" x="12" y="16">
          {questionIndex + 1}
        </text>
      </SvgIcon>
    );
  };

  const renderStepper = () => {
    if (!questionIds || questionIds.length <= 1) {
      return null;
    }

    return (
      <Stepper
        activeStep={stepIndex}
        connector={<div />}
        nonLinear
        style={{ justifyContent: 'center', flexWrap: 'wrap', padding: 24 }}
      >
        {questionIds.map((questionId, index) => {
          if (published || skippable || graderView || index <= maxStep) {
            return (
              <Step key={questionId} active={index <= maxStep}>
                <StepButton
                  icon={renderStepperIcon(questionId, index)}
                  onClick={() => handleStepClick(index)}
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
  };

  return (
    <div style={styles.questionContainer}>
      {renderStepper()}

      <FormProvider {...methods}>
        <form
          encType="multipart/form-data"
          id={formNames.SUBMISSION}
          noValidate
          onSubmit={handleSubmit((data) => onSubmit({ ...data }))}
        >
          <ErrorText errors={errors} />

          <Paper className="mb-5 p-6" variant="outlined">
            {renderStepQuestion()}
          </Paper>

          {renderSubmitDialog()}
        </form>
      </FormProvider>

      {renderGradingPanel()}

      <div>
        {renderSaveGradeButton()}
        {renderSaveDraftButton()}

        <div style={{ display: 'inline', float: 'right' }}>
          {renderFinaliseButton()}
        </div>

        {renderUnsubmitButton()}
      </div>

      {renderUnsubmitDialog()}
      {renderResetDialog()}
    </div>
  );
};

SubmissionEditStepForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,

  graderView: PropTypes.bool.isRequired,
  maxStep: PropTypes.number.isRequired,
  step: PropTypes.number,
  skippable: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

  codaveriFeedbackStatus: PropTypes.object,
  explanations: PropTypes.objectOf(explanationShape),
  allConsideredCorrect: PropTypes.bool.isRequired,
  allowPartialSubmission: PropTypes.bool.isRequired,
  showMcqAnswer: PropTypes.bool.isRequired,
  showMcqMrqSolution: PropTypes.bool.isRequired,
  isCodaveriEnabled: PropTypes.bool.isRequired,

  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(questionShape),
  historyQuestions: PropTypes.objectOf(historyQuestionShape),
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  topics: PropTypes.objectOf(topicShape),
  isSaving: PropTypes.bool.isRequired,
  savingStatus: PropTypes.object.isRequired,

  onReset: PropTypes.func,
  onSaveAnswer: PropTypes.func,
  onSaveDraft: PropTypes.func,
  onSubmit: PropTypes.func,
  onSubmitAnswer: PropTypes.func,
  onReevaluateAnswer: PropTypes.func,
  onGenerateFeedback: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleSaveAllGrades: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleToggleViewHistoryMode: PropTypes.func,
};

export default injectIntl(SubmissionEditStepForm);
