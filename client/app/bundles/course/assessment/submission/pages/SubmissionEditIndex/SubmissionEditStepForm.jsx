import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
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
} from '@mui/material';
import { blue, green, lightBlue, red } from '@mui/material/colors';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import ErrorText from 'lib/components/ErrorText';
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
    explanations,
    graderView,
    onReset,
    onSaveDraft,
    onSubmit,
    onSubmitAnswer,
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

  let initialStep = step || 0;
  initialStep = initialStep < 0 ? 0 : initialStep;
  initialStep = initialStep > maxInitialStep ? maxInitialStep : initialStep;

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

  useEffect(() => {
    reset(initialValues);
  }, [initialValues]);

  // eslint-disable-next-line consistent-return
  const handleUnload = (e) => {
    if (isDirty) {
      e.preventDefault();
      // Chrome
      e.returnValue = '';
      return '';
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

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
    if (shouldRenderContinueButton()) {
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
    }
    return null;
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
    if (attempting && (allowPartialSubmission || allConsideredCorrect)) {
      return (
        <Button
          variant="contained"
          color="secondary"
          disabled={isSaving}
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
    if (!attempting) {
      return <GradingPanel />;
    }
    return null;
  };

  const renderQuestionGrading = (id) => {
    const editable = !attempting && graderView;
    const visible = editable || published;

    return visible ? <QuestionGrade id={id} editable={editable} /> : null;
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
    if (attempting) {
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
    }
    return null;
  };

  const renderSaveGradeButton = () => {
    if (graderView && !attempting) {
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
    }
    return null;
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
            onSubmitAnswer(answerId, getValues(`${answerId}`), setValue)
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
              onSubmitAnswer(answerId, getValues(`${answerId}`), setValue)
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
    if (graderView && !attempting) {
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
    }
    return null;
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
          {renderFinaliseButton()}
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
  intl: intlShape.isRequired,

  graderView: PropTypes.bool.isRequired,
  maxStep: PropTypes.number.isRequired,
  step: PropTypes.number,
  skippable: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

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
  handleUnsubmit: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleToggleViewHistoryMode: PropTypes.func,
};

export default injectIntl(SubmissionEditStepForm);
