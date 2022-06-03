import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { FormattedMessage, injectIntl } from 'react-intl';
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
} from '@mui/material';
import { blue, green, lightBlue, red } from '@mui/material/colors';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import ErrorText from 'lib/components/ErrorText';
import {
  answerStatusShape,
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
    answerStatus,
    allConsideredCorrect,
    allowPartialSubmission,
    attempting,
    explanations,
    graderView,
    onReset,
    onSaveDraft,
    onSubmit,
    onSubmitAnswer,
    onReevaluateAnswer,
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
    resetField,
    setValue,
    formState: { errors, isDirty, dirtyFields },
  } = methods;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues]);

  const isOutdated = (question) => {
    const isBackendOutdated = !answerStatus[question.id].isLatestAnswer;
    const isFrontendDirty = question.answerId in dirtyFields;
    return isBackendOutdated || isFrontendDirty;
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

  const shouldDisableFinaliseButton = () =>
    isSaving ||
    (!allowPartialSubmission && isDirty && Object.keys(dirtyFields).length > 0);

  const shouldRenderContinueButton = () =>
    !isLastQuestion(questionIds, stepIndex);

  const isStepButtonActive = (index) => {
    if (index === 0) return true;

    const previousQuestion = questionIds[index - 1];

    return (
      index <= maxStep ||
      (explanations[previousQuestion] && explanations[previousQuestion].correct)
    );
  };

  const handleNext = () => {
    setMaxStep(Math.max(maxStep, stepIndex + 1));
    setStepIndex(stepIndex + 1);
  };

  const handleStepClick = (index) => {
    if (published || skippable || graderView || isStepButtonActive(index)) {
      setStepIndex(index);
      setMaxStep(Math.max(maxStep, stepIndex));
    }
  };

  const renderAnswerLoadingIndicator = () => {
    const id = questionIds[stepIndex];
    const { isAutograding, isResetting } = questionsFlags[id] || {};

    if (isAutograding || isResetting) {
      return <CircularProgress size={36} style={{ position: 'absolute' }} />;
    }
    return null;
  };

  const renderAutogradingErrorPanel = (id) => {
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
  };

  const renderContinueButton = () => {
    const disabled = shouldDisableContinueButton();
    if (!shouldRenderContinueButton()) {
      return null;
    }
    return (
      <Button
        variant="contained"
        disabled={disabled}
        onClick={() => handleNext()}
        style={{
          ...styles.formButton,
          ...(!disabled && styles.contineButton),
        }}
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

      if (question.autogradable && isOutdated(question)) {
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
  };

  const renderFinaliseButton = () => {
    const disabled = shouldDisableFinaliseButton();
    if (attempting && (allowPartialSubmission || allConsideredCorrect)) {
      return (
        <Button
          variant="contained"
          color="secondary"
          disabled={disabled}
          onClick={() => setSubmitConfirmation(true)}
          style={styles.formButton}
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

    return visible ? <QuestionGrade id={id} editable={editable} /> : null;
  };

  const renderReevaluateButton = () => {
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;
    const { isAutograding } = questionsFlags[id] || {};
    if (question.type !== 'Programming') {
      return null;
    }

    return (
      <Button
        variant="contained"
        color="secondary"
        disabled={isAutograding || isSaving}
        id="re-evaluate-code"
        onClick={() => onReevaluateAnswer(answerId, question.id)}
        style={styles.formButton}
      >
        {intl.formatMessage(translations.reevaluate)}
      </Button>
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
          variant="outlined"
          color="info"
          disabled={isAutograding || isResetting || isSaving}
          onClick={() => {
            setResetConfirmation(true);
            setResetAnswerId(answerId);
          }}
          style={styles.formButton}
        >
          {intl.formatMessage(translations.reset)}
        </Button>
      );
    }
    return null;
  };

  const renderResetDialog = () => (
    <ConfirmationDialog
      open={resetConfirmation}
      onCancel={() => {
        setResetConfirmation(false);
        setResetAnswerId(null);
      }}
      onConfirm={() => {
        setResetConfirmation(false);
        setResetAnswerId(null);
        onReset(resetAnswerId, setValue);
      }}
      message={intl.formatMessage(translations.resetConfirmation)}
    />
  );

  const renderSaveDraftButton = () => {
    if (!attempting) {
      return null;
    }
    return (
      <Button
        variant="contained"
        color="primary"
        disabled={!isDirty || isSaving}
        onClick={handleSubmit((data) => onSaveDraft({ ...data }))}
        style={styles.formButton}
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
        variant="contained"
        color="primary"
        disabled={isSaving}
        onClick={handleSaveGrade}
        style={styles.formButton}
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
          keyName="command+enter,control+enter"
          onKeyDown={() =>
            onSubmitAnswer(
              answerId,
              getValues(`${answerId}`),
              setValue,
              resetField,
            )
          }
          disabled={isAutograding || isResetting || isSaving}
          filter={() => true}
        />
        <Tooltip title={<FormattedMessage {...translations.submitTooltip} />}>
          <Button
            variant="contained"
            color="secondary"
            disabled={isAutograding || isResetting || isSaving}
            onClick={() =>
              onSubmitAnswer(
                answerId,
                getValues(`${answerId}`),
                setValue,
                resetField,
              )
            }
            style={styles.formButton}
          >
            {intl.formatMessage(translations.submit)}
          </Button>
        </Tooltip>
      </>
    );
  };

  const renderSubmitDialog = () => (
    <ConfirmationDialog
      open={submitConfirmation}
      onCancel={() => setSubmitConfirmation(false)}
      onConfirm={() => setSubmitConfirmation(false)}
      form={formNames.SUBMISSION}
      message={intl.formatMessage(translations.submitConfirmation)}
    />
  );

  const renderUnsubmitButton = () => {
    const shouldRenderUnsubmitButton = graderView && !attempting;
    if (!shouldRenderUnsubmitButton) {
      return null;
    }
    return (
      <Button
        variant="contained"
        color="secondary"
        disabled={isSaving}
        onClick={() => setUnsubmitConfirmation(true)}
        style={styles.formButton}
      >
        {intl.formatMessage(translations.unsubmit)}
      </Button>
    );
  };

  const renderUnsubmitDialog = () => (
    <ConfirmationDialog
      open={unsubmitConfirmation}
      onCancel={() => setUnsubmitConfirmation(false)}
      onConfirm={() => {
        setUnsubmitConfirmation(false);
        handleUnsubmit();
      }}
      message={intl.formatMessage(translations.unsubmitConfirmation)}
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
            questionsFlags,
            historyQuestions,
            graderView,
            showMcqMrqSolution,
            handleToggleViewHistoryMode,
          }}
        />
        {renderAutogradingErrorPanel(id)}
        {renderExplanationPanel(question)}
        {!attempting && graderView ? renderReevaluateButton() : null}
        {renderQuestionGrading(id)}
        {renderGradingPanel()}
        {attempting ? (
          <div>
            {renderResetButton()}
            {renderSubmitButton()}
            {renderContinueButton()}
            {renderAnswerLoadingIndicator()}
          </div>
        ) : null}
        <div>
          {renderSaveGradeButton()}
          {renderSaveDraftButton()}

          <div style={{ display: 'inline', float: 'right' }}>
            {renderFinaliseButton()}
          </div>

          {renderUnsubmitButton()}
        </div>
        <hr />
        <Comments topic={topic} />
      </>
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
          let stepButtonColor = '';
          const isCurrentQuestion = index === stepIndex;
          if (
            explanations[questionId] &&
            explanations[questionId].correct &&
            !isOutdated(questions[questionId])
          ) {
            stepButtonColor = isCurrentQuestion ? green[700] : green[300];
          } else {
            stepButtonColor = isCurrentQuestion ? blue[800] : lightBlue[400];
          }
          if (
            published ||
            skippable ||
            graderView ||
            isStepButtonActive(index)
          ) {
            return (
              <Step key={questionId}>
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
      <Card style={styles.questionCardContainer}>
        <FormProvider {...methods}>
          <form
            encType="multipart/form-data"
            id={formNames.SUBMISSION}
            onSubmit={handleSubmit((data) => onSubmit({ ...data }))}
            noValidate
          >
            <ErrorText errors={errors} />
            {renderStepQuestion()}
            {renderSubmitDialog()}
          </form>
        </FormProvider>
      </Card>
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

  answerStatus: PropTypes.objectOf(answerStatusShape),
  explanations: PropTypes.objectOf(explanationShape),
  allConsideredCorrect: PropTypes.bool.isRequired,
  allowPartialSubmission: PropTypes.bool.isRequired,
  showMcqAnswer: PropTypes.bool.isRequired,
  showMcqMrqSolution: PropTypes.bool.isRequired,
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(questionShape),
  historyQuestions: PropTypes.objectOf(historyQuestionShape),
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  topics: PropTypes.objectOf(topicShape),
  isSaving: PropTypes.bool.isRequired,

  onReset: PropTypes.func,
  onSaveDraft: PropTypes.func,
  onSubmit: PropTypes.func,
  onSubmitAnswer: PropTypes.func,
  onReevaluateAnswer: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleToggleViewHistoryMode: PropTypes.func,
};

export default injectIntl(SubmissionEditStepForm);
