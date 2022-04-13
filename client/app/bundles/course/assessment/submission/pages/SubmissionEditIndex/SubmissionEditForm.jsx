import { Suspense, lazy, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { injectIntl, intlShape } from 'react-intl';
import { Element, scroller } from 'react-scroll';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import { blue, grey, yellow, red } from '@mui/material/colors';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import ErrorText from 'lib/components/ErrorText';
import {
  explanationShape,
  questionShape,
  historyQuestionShape,
  questionFlagsShape,
  questionGradeShape,
  topicShape,
} from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import QuestionGrade from '../../containers/QuestionGrade';
import GradingPanel from '../../containers/GradingPanel';
import { formNames, questionTypes } from '../../constants';
import translations from '../../translations';

const Comments = lazy(() =>
  import(/* webpackChunkName: "comment" */ '../../containers/Comments'),
);

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

const SubmissionEditForm = (props) => {
  const {
    attempting,
    canUpdate,
    explanations,
    delayedGradePublication,
    graded,
    graderView,
    grading,
    handleAutogradeSubmission,
    handleMark,
    handlePublish,
    onReset,
    onSaveDraft,
    onSubmit,
    onSubmitAnswer,
    handleSaveGrade,
    handleToggleViewHistoryMode,
    handleUnmark,
    handleUnsubmit,
    historyQuestions,
    initialValues,
    intl,
    isAutograding,
    isSaving,
    newSubmission,
    passwordProtected,
    published,
    questionIds,
    questions,
    questionsFlags,
    showMcqMrqSolution,
    submitted,
    tabbedView,
    topics,
  } = props;

  const [examNotice, setExamNotice] = useState(
    newSubmission && passwordProtected,
  );
  const [submitConfirmation, setSubmitConfirmation] = useState(false);
  const [unsubmitConfirmation, setUnsubmitConfirmation] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState(false);
  const [resetAnswerId, setResetAnswerId] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

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
    let initialStep = props.step;

    if (initialStep !== null && !tabbedView) {
      initialStep = initialStep < 0 ? 0 : initialStep;
      initialStep =
        initialStep >= questionIds.length - 1
          ? questionIds.length - 1
          : initialStep;
      setStepIndex(initialStep);
      scroller.scrollTo(`step${initialStep}`, { offset: -60 });
    }

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const renderAutogradeSubmissionButton = () => {
    if (graderView && submitted) {
      const progressIcon = <CircularProgress size={24} />;

      return (
        <Button
          variant="contained"
          color="primary"
          disabled={isSaving || isAutograding}
          onClick={handleAutogradeSubmission}
          style={styles.formButton}
        >
          {isAutograding && progressIcon}
          {intl.formatMessage(translations.autograde)}
        </Button>
      );
    }
    return null;
  };

  const renderExamDialog = () => (
    <Dialog open={examNotice} maxWidth="xl">
      <DialogTitle>
        {intl.formatMessage(translations.examDialogTitle)}
      </DialogTitle>
      <DialogContent>
        {intl.formatMessage(translations.examDialogMessage)}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => setExamNotice(false)}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderExplanationPanel = (questionId) => {
    const explanation = explanations[questionId];

    if (explanation && explanation.correct === false && attempting) {
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
                  <div key={key} dangerouslySetInnerHTML={{ __html: exp }} />
                );
              })}
            </CardContent>
          )}
        </Card>
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

  const renderMarkButton = () => {
    if (delayedGradePublication && graderView && submitted) {
      const anyUngraded = Object.values(grading).some(
        (q) => q.grade === undefined || q.grade === null,
      );
      return (
        <Button
          variant="contained"
          disabled={isSaving || anyUngraded}
          onClick={handleMark}
          style={{
            ...styles.formButton,
            backgroundColor: yellow[900],
            color: 'white',
          }}
        >
          {intl.formatMessage(translations.mark)}
        </Button>
      );
    }
    return null;
  };

  const renderProgrammingQuestionActions = (id) => {
    const question = questions[id];
    const { answerId, attemptsLeft, attemptLimit, autogradable } = question;
    const {
      jobError,
      isAutograding: isAutogradingQuestion,
      isResetting,
    } = questionsFlags[id] || {};

    if (!attempting) {
      return null;
    }

    if (question.type === questionTypes.Programming) {
      const runCodeLabel = attemptLimit
        ? intl.formatMessage(translations.runCodeWithLimit, { attemptsLeft })
        : intl.formatMessage(translations.runCode);

      return (
        <>
          {jobError ? (
            <Paper
              style={{
                padding: 10,
                backgroundColor: red[100],
                marginBottom: 20,
              }}
            >
              {intl.formatMessage(translations.autogradeFailure)}
            </Paper>
          ) : null}
          <Button
            variant="contained"
            disabled={isAutogradingQuestion || isResetting || isSaving}
            onClick={() => {
              setResetConfirmation(true);
              setResetAnswerId(answerId);
            }}
            style={styles.formButton}
          >
            {intl.formatMessage(translations.reset)}
          </Button>
          {autogradable ? (
            <>
              <Button
                variant="contained"
                color="secondary"
                disabled={
                  isAutogradingQuestion ||
                  isResetting ||
                  isSaving ||
                  (!graderView && attemptsLeft === 0)
                }
                id="run-code"
                onClick={() =>
                  onSubmitAnswer(answerId, getValues(`${answerId}`), setValue)
                }
                style={styles.formButton}
              >
                {runCodeLabel}
              </Button>
            </>
          ) : null}
          {isAutogradingQuestion || isResetting ? (
            <CircularProgress size={36} style={{ position: 'absolute' }} />
          ) : null}
        </>
      );
    }
    return null;
  };

  const renderPublishButton = () => {
    if (!delayedGradePublication && graderView && submitted) {
      const anyUngraded = Object.values(grading).some(
        (q) => q.grade === undefined || q.grade === null,
      );

      return (
        <Button
          variant="contained"
          color="secondary"
          disabled={isSaving || anyUngraded}
          onClick={handlePublish}
          style={styles.formButton}
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

    return visible ? <QuestionGrade id={id} editable={editable} /> : null;
  };

  const renderQuestions = () => (
    <>
      {questionIds.map((id, index) => {
        const question = questions[id];
        const { answerId, topicId, viewHistory } = question;
        const topic = topics[topicId];
        return (
          <Element
            name={`step${index}`}
            key={id}
            style={styles.questionContainer}
          >
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
            {question.type === questionTypes.Programming && !viewHistory
              ? renderExplanationPanel(id)
              : null}
            {viewHistory ? null : renderQuestionGrading(id)}
            {viewHistory ? null : renderProgrammingQuestionActions(id)}
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
          </Element>
        );
      })}
    </>
  );

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
          type="submit"
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
    if (attempting && canUpdate) {
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

  const renderSubmitDialog = () => (
    <ConfirmationDialog
      open={submitConfirmation}
      onCancel={() => setSubmitConfirmation(false)}
      onConfirm={() => setSubmitConfirmation(false)}
      form={formNames.SUBMISSION}
      message={intl.formatMessage(translations.submitConfirmation)}
    />
  );

  const renderTabbedQuestions = () => (
    <Tabs
      onChange={(event, value) => {
        setStepIndex(value);
      }}
      style={{ backgroundColor: grey[100], color: blue[500] }}
      TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
      value={stepIndex}
      variant="fullWidth"
    >
      {questionIds.map((id, index) => (
        <Tab
          key={id}
          label={intl.formatMessage(translations.questionNumber, {
            number: index + 1,
          })}
          style={{ minWidth: 10 }}
          value={index}
        />
      ))}
    </Tabs>
  );

  const renderTabbedQuestionsContent = () => {
    const questionId = questionIds[stepIndex];
    const question = questions[questionId];
    const { answerId, topicId, viewHistory } = question;
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
        {question.type === questionTypes.Programming && !viewHistory
          ? renderExplanationPanel(questionId)
          : null}
        {viewHistory ? null : renderQuestionGrading(questionId)}
        {viewHistory ? null : renderProgrammingQuestionActions(questionId)}
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
    if (graderView && graded) {
      return (
        <Button
          variant="contained"
          disabled={isSaving}
          onClick={handleUnmark}
          style={{
            ...styles.formButton,
            backgroundColor: yellow[900],
            color: 'white',
          }}
        >
          {intl.formatMessage(translations.unmark)}
        </Button>
      );
    }
    return null;
  };

  const renderUnsubmitButton = () => {
    if (graderView && (submitted || published)) {
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

  return (
    <Card style={styles.questionCardContainer}>
      <FormProvider {...methods}>
        <form
          encType="multipart/form-data"
          id={formNames.SUBMISSION}
          onSubmit={handleSubmit((data) => onSubmit({ ...data }))}
          noValidate
        >
          <ErrorText errors={errors} />

          {tabbedView ? (
            <>
              {renderTabbedQuestions()}
              {renderTabbedQuestionsContent()}
            </>
          ) : (
            renderQuestions()
          )}
          {renderGradingPanel()}

          {renderSaveDraftButton()}
          {renderSaveGradeButton()}
          {renderAutogradeSubmissionButton()}
          {renderSubmitButton()}
          {renderUnsubmitButton()}
          {renderMarkButton()}
          {renderUnmarkButton()}
          {renderPublishButton()}

          {renderSubmitDialog()}
        </form>
      </FormProvider>

      {renderUnsubmitDialog()}
      {renderResetDialog()}
      {renderExamDialog()}

    </Card>
  );
};

SubmissionEditForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  intl: intlShape.isRequired,

  graderView: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  delayedGradePublication: PropTypes.bool.isRequired,
  newSubmission: PropTypes.bool.isRequired,
  passwordProtected: PropTypes.bool.isRequired,
  tabbedView: PropTypes.bool.isRequired,
  step: PropTypes.number,

  showMcqMrqSolution: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  graded: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

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
  handleUnsubmit: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleMark: PropTypes.func,
  handleUnmark: PropTypes.func,
  handlePublish: PropTypes.func,
  handleToggleViewHistoryMode: PropTypes.func,
};

export default injectIntl(SubmissionEditForm);
