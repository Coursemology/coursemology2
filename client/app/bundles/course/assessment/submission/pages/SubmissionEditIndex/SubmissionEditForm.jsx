import { lazy, Suspense, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Element, scroller } from 'react-scroll';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Step,
  StepButton,
  Stepper,
  SvgIcon,
  Typography,
} from '@mui/material';
import { blue, grey, red, yellow } from '@mui/material/colors';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import ErrorText from 'lib/components/core/ErrorText';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import usePrompt from 'lib/hooks/router/usePrompt';

import SubmissionAnswer from '../../components/answers';
import EvaluatorErrorPanel from '../../components/EvaluatorErrorPanel';
import { formNames, questionTypes } from '../../constants';
import GradingPanel from '../../containers/GradingPanel';
import QuestionGrade from '../../containers/QuestionGrade';
import {
  attachmentShape,
  explanationShape,
  historyQuestionShape,
  questionFlagsShape,
  questionGradeShape,
  questionShape,
  topicShape,
} from '../../propTypes';
import translations from '../../translations';
import { setTimerForForceSubmission } from '../../utils/timer';

import { errorResolver } from './ErrorHelper';

const Comments = lazy(
  () => import(/* webpackChunkName: "comment" */ '../../containers/Comments'),
);

const styles = {
  explanationContainer: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 5,
  },
  formButton: {
    marginBottom: 10,
    marginRight: 10,
  },
  stepButton: {
    marginBottom: 5,
    marginRight: 5,
  },
};

const SubmissionEditForm = (props) => {
  const {
    attachments,
    attempting,
    canUpdate,
    codaveriFeedbackStatus,
    explanations,
    deadline,
    delayedGradePublication,
    graded,
    graderView,
    grading,
    handleAutogradeSubmission,
    handleMark,
    handlePublish,
    isCodaveriEnabled,
    onReset,
    onSaveDraft,
    onSubmit,
    onSubmitAnswer,
    onGenerateFeedback,
    onReevaluateAnswer,
    handleSaveAllGrades,
    handleSaveGrade,
    handleUnmark,
    handleUnsubmit,
    historyQuestions,
    initialValues,
    intl,
    isAutograding,
    isSaving,
    passwordProtected,
    published,
    questionIds,
    questions,
    questionsFlags,
    showMcqMrqSolution,
    submitted,
    tabbedView,
    maxStep: maxInitialStep,
    step,
    topics,
  } = props;

  let initialStep = Math.min(maxInitialStep, Math.max(0, step || 0));

  const [examNotice, setExamNotice] = useState(passwordProtected);
  const [submitConfirmation, setSubmitConfirmation] = useState(false);
  const [unsubmitConfirmation, setUnsubmitConfirmation] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState(false);
  const [resetAnswerId, setResetAnswerId] = useState(null);
  const [stepIndex, setStepIndex] = useState(initialStep);

  const methods = useForm({
    defaultValues: initialValues,
    resolver: errorResolver(questions, attachments),
  });

  const {
    getValues,
    handleSubmit,
    reset,
    resetField,
    formState: { errors, isDirty },
  } = methods;
  usePrompt(isDirty);

  useEffect(() => {
    reset(initialValues);
  }, [initialValues]);

  useEffect(() => {
    initialStep = props.step;

    if (initialStep !== null && !tabbedView) {
      initialStep = initialStep < 0 ? 0 : initialStep;
      initialStep =
        initialStep >= questionIds.length - 1
          ? questionIds.length - 1
          : initialStep;
      setStepIndex(initialStep);
      scroller.scrollTo(`step${initialStep}`, { offset: -60 });
    }
  }, []);

  useEffect(
    setTimerForForceSubmission(
      deadline,
      attempting,
      handleSubmit((data) => onSubmit({ ...data })),
    ),
    [deadline],
  );

  const renderAutogradeSubmissionButton = () => {
    if (graderView && submitted) {
      return (
        <Button
          color="primary"
          disabled={isSaving || isAutograding}
          endIcon={isAutograding && <LoadingIndicator bare size={20} />}
          onClick={handleAutogradeSubmission}
          style={styles.formButton}
          variant="contained"
        >
          {intl.formatMessage(translations.autograde)}
        </Button>
      );
    }
    return null;
  };

  const renderExamDialog = () => (
    <Dialog maxWidth="lg" open={attempting && examNotice}>
      <DialogTitle>
        {intl.formatMessage(translations.examDialogTitle)}
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" variant="body2">
          {intl.formatMessage(translations.examDialogMessage)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => setExamNotice(false)}>
          {intl.formatMessage(translations.ok)}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderExplanationPanel = (questionId) => {
    const explanation = explanations[questionId];
    const shouldRenderExplanationPanel =
      explanation && explanation.correct === false && attempting;

    if (!shouldRenderExplanationPanel) {
      return null;
    }
    let title = '';
    if (explanation.failureType === 'public_test') {
      title = intl.formatMessage(translations.publicTestCaseFailure);
    } else if (explanation.failureType === 'private_test') {
      title = intl.formatMessage(translations.privateTestCaseFailure);
    } else {
      return null;
    }

    return (
      <Card style={styles.explanationContainer}>
        <CardHeader
          style={{
            ...styles.explanationHeader,
            backgroundColor: red[200],
            color: red[900],
          }}
          title={title}
          titleTypographyProps={{ variant: 'body2' }}
        />
        {explanation.explanations.every(
          (exp) => exp.trim().length === 0,
        ) ? null : (
          <CardContent>
            {explanation.explanations.map((exp, index) => {
              const key = `question-${questionId}-explanation-${index}`;
              return (
                <Typography
                  key={key}
                  dangerouslySetInnerHTML={{ __html: exp }}
                  variant="body2"
                />
              );
            })}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderGradingPanel = () => {
    if (attempting) {
      return null;
    }
    return <GradingPanel />;
  };

  const renderMarkButton = () => {
    const shouldRenderMarkButton =
      delayedGradePublication && graderView && submitted;
    if (!shouldRenderMarkButton) {
      return null;
    }
    const anyUngraded = Object.values(grading).some(
      (q) => q.grade === undefined || q.grade === null,
    );
    const disabled = isSaving || anyUngraded;
    return (
      <Button
        disabled={disabled}
        onClick={handleMark}
        style={{
          ...styles.formButton,
          backgroundColor: disabled ? grey[300] : yellow[900],
          color: disabled ? grey[600] : 'white',
        }}
        variant="contained"
      >
        {intl.formatMessage(translations.mark)}
      </Button>
    );
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

  const renderProgrammingQuestionActions = (id) => {
    const question = questions[id];
    const { answerId, attemptsLeft, attemptLimit, autogradable } = question;
    const { isAutograding: isAutogradingQuestion, isResetting } =
      questionsFlags[id] || {};

    if (question.type !== questionTypes.Programming) {
      return null;
    }

    if (!attempting && graderView) {
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
            disabled={isAutogradingQuestion || isSaving}
            endIcon={
              isAutogradingQuestion && <LoadingIndicator bare size={20} />
            }
            id="re-evaluate-code"
            onClick={() => onReevaluateAnswer(answerId, question.id)}
            style={styles.formButton}
            variant="contained"
          >
            {intl.formatMessage(translations.reevaluate)}
          </Button>
        </>
      );
    }

    if (!attempting) {
      return null;
    }

    const runCodeLabel = attemptLimit
      ? intl.formatMessage(translations.runCodeWithLimit, { attemptsLeft })
      : intl.formatMessage(translations.runCode);

    return (
      <>
        <Button
          disabled={isAutogradingQuestion || isResetting || isSaving}
          onClick={() => {
            setResetConfirmation(true);
            setResetAnswerId(answerId);
          }}
          style={styles.formButton}
          variant="contained"
        >
          {intl.formatMessage(translations.reset)}
        </Button>
        {autogradable && (
          <Button
            color="secondary"
            disabled={
              isAutogradingQuestion ||
              isResetting ||
              isSaving ||
              (!graderView && attemptsLeft === 0)
            }
            endIcon={
              isAutogradingQuestion && <LoadingIndicator bare size={20} />
            }
            id="run-code"
            onClick={() =>
              onSubmitAnswer(answerId, getValues(`${answerId}`), resetField)
            }
            style={styles.formButton}
            variant="contained"
          >
            {runCodeLabel}
          </Button>
        )}
      </>
    );
  };

  const renderPublishButton = () => {
    if (!delayedGradePublication && graderView && submitted) {
      const anyUngraded = Object.values(grading).some(
        (q) => q.grade === undefined || q.grade === null,
      );

      return (
        <Button
          color="secondary"
          disabled={isSaving || anyUngraded}
          onClick={handlePublish}
          style={styles.formButton}
          variant="contained"
        >
          {intl.formatMessage(translations.publish)}
        </Button>
      );
    }
    return null;
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

  const renderQuestions = () => (
    <div className="space-y-8">
      {questionIds.map((id, index) => {
        const question = questions[id];
        const { answerId, topicId, viewHistory } = question;
        const topic = topics[topicId];
        const allErrors = errors[answerId]?.errorTypes ?? [];

        return (
          <Element key={id} name={`step${index}`}>
            <Paper className="mb-5 p-6" variant="outlined">
              <SubmissionAnswer
                {...{
                  readOnly: !attempting,
                  answerId,
                  allErrors,
                  question,
                  questionType: question.type,
                  historyQuestions,
                  graderView,
                  showMcqMrqSolution,
                }}
              />
              {question.type === questionTypes.Programming &&
                !viewHistory &&
                renderExplanationPanel(id)}

              {!viewHistory && renderAutogradingErrorPanel(id)}
              {!viewHistory && renderProgrammingQuestionActions(id)}
              {!viewHistory && renderQuestionGrading(id)}

              <Suspense
                fallback={
                  <Typography style={styles.loadingComment} variant="body2">
                    {intl.formatMessage(translations.loadingComment)}
                  </Typography>
                }
              >
                <Comments topic={topic} />
              </Suspense>
            </Paper>
          </Element>
        );
      })}
    </div>
  );

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
        onReset(resetAnswerId, resetField);
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
        onClick={handleSubmit((data) => onSaveDraft({ ...data }, resetField))}
        style={styles.formButton}
        type="submit"
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
    const shouldRenderSubmitButton = attempting && canUpdate;
    if (!shouldRenderSubmitButton) {
      return null;
    }
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

  const renderSteppedQuestions = () => (
    <Stepper
      activeStep={stepIndex}
      connector={<div />}
      nonLinear
      style={{ justifyContent: 'center', flexWrap: 'wrap', padding: 10 }}
    >
      {questionIds.map((id, index) => {
        let stepButtonColor = '';
        const isCurrentQuestion = index === stepIndex;
        stepButtonColor = isCurrentQuestion ? blue[800] : blue[400];
        return (
          <Step key={id} sx={{ width: 55, height: 50 }}>
            <StepButton
              icon={
                <SvgIcon htmlColor={stepButtonColor}>
                  <circle cx="12" cy="12" r="12" />
                  <text
                    fill="#fff"
                    fontSize="12"
                    textAnchor="middle"
                    x="12"
                    y="16"
                  >
                    {index + 1}
                  </text>
                </SvgIcon>
              }
              onClick={() => {
                setStepIndex(index);
              }}
              style={styles.stepButton}
            />
          </Step>
        );
      })}
    </Stepper>
  );

  const renderSteppedQuestionsContent = () => {
    const questionId = questionIds[stepIndex];
    const question = questions[questionId];
    const { answerId, topicId, viewHistory } = question;
    const topic = topics[topicId];
    const allErrors = errors[answerId]?.errorTypes ?? [];

    return (
      <>
        <SubmissionAnswer
          {...{
            readOnly: !attempting,
            answerId,
            allErrors,
            question,
            questionType: question.type,
            historyQuestions,
            graderView,
            showMcqMrqSolution,
          }}
        />
        {question.type === questionTypes.Programming && !viewHistory
          ? renderExplanationPanel(questionId)
          : null}
        {viewHistory ? null : renderAutogradingErrorPanel(questionId)}
        {viewHistory ? null : renderProgrammingQuestionActions(questionId)}
        {viewHistory ? null : renderQuestionGrading(questionId)}
        <Suspense
          fallback={
            <>
              <br />
              <div>{intl.formatMessage(translations.loadingComment)}</div>
            </>
          }
        >
          <Comments topic={topic} />
        </Suspense>
        <hr />
      </>
    );
  };

  const renderUnmarkButton = () => {
    const shouldRenderUnmarkButton = graderView && graded;
    if (!shouldRenderUnmarkButton) {
      return null;
    }
    return (
      <Button
        disabled={isSaving}
        onClick={handleUnmark}
        style={{
          ...styles.formButton,
          backgroundColor: yellow[900],
          color: 'white',
        }}
        variant="contained"
      >
        {intl.formatMessage(translations.unmark)}
      </Button>
    );
  };

  const renderUnsubmitButton = () => {
    const shouldRenderUnsubmitButton = graderView && (submitted || published);
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

  const renderErrorMessages = () => (
    <div className="flex flex-col text-right">
      <ErrorText
        errors={
          Object.keys(errors).length > 0 &&
          intl.formatMessage(translations.submissionError, {
            questions: Object.values(errors)
              .map((error) => error.questionNumber)
              .join(', '),
          })
        }
      />
    </div>
  );

  return (
    <>
      <FormProvider {...methods}>
        <form
          encType="multipart/form-data"
          id={formNames.SUBMISSION}
          noValidate
          onSubmit={handleSubmit((data) => onSubmit({ ...data }))}
        >
          {tabbedView ? (
            <>
              {renderSteppedQuestions()}
              {renderSteppedQuestionsContent()}
            </>
          ) : (
            renderQuestions()
          )}
          {renderGradingPanel()}

          {renderSaveDraftButton()}
          {renderSaveGradeButton()}
          {renderAutogradeSubmissionButton()}

          <div style={{ display: 'inline', float: 'right' }}>
            {renderSubmitButton()}
          </div>

          {renderUnsubmitButton()}
          {renderMarkButton()}
          {renderUnmarkButton()}
          {renderPublishButton()}
          {renderErrorMessages()}

          {renderSubmitDialog()}
        </form>
      </FormProvider>

      {renderUnsubmitDialog()}
      {renderResetDialog()}
      {renderExamDialog()}
    </>
  );
};

SubmissionEditForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,

  attachments: PropTypes.arrayOf(attachmentShape),
  graderView: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  deadline: PropTypes.number,
  delayedGradePublication: PropTypes.bool.isRequired,
  passwordProtected: PropTypes.bool.isRequired,
  tabbedView: PropTypes.bool.isRequired,
  maxStep: PropTypes.number.isRequired,
  step: PropTypes.number,
  showMcqMrqSolution: PropTypes.bool.isRequired,
  isCodaveriEnabled: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  graded: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

  codaveriFeedbackStatus: PropTypes.object,
  explanations: PropTypes.objectOf(explanationShape),
  grading: PropTypes.objectOf(questionGradeShape),
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(questionShape),
  historyQuestions: PropTypes.objectOf(historyQuestionShape),
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  topics: PropTypes.objectOf(topicShape),
  isAutograding: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,

  handleAutogradeSubmission: PropTypes.func,
  onReset: PropTypes.func,
  onSaveDraft: PropTypes.func,
  onSubmit: PropTypes.func,
  onSubmitAnswer: PropTypes.func,
  onReevaluateAnswer: PropTypes.func,
  onGenerateFeedback: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleSaveAllGrades: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleMark: PropTypes.func,
  handleUnmark: PropTypes.func,
  handlePublish: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    attachments: state.assessments.submission.attachments,
  };
}

export default connect(mapStateToProps)(injectIntl(SubmissionEditForm));
