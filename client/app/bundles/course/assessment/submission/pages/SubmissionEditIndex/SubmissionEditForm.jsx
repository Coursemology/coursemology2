import { Component, Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { Prompt } from 'react-router-dom';
import { injectIntl, intlShape } from 'react-intl';
import { Element, scroller } from 'react-scroll';
import { Button, Tab, Tabs } from '@material-ui/core';
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
} from '@mui/material';
import { blue, grey, yellow, red } from '@mui/material/colors';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
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
import submissionFormValidate from './submissionFormValidate';

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

class SubmissionEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      examNotice: props.newSubmission && props.passwordProtected,
      submitConfirmation: false,
      unsubmitConfirmation: false,
      resetConfirmation: false,
      resetAnswerId: null,
      stepIndex: 0,
    };
  }

  componentDidMount() {
    const { questionIds, tabbedView } = this.props;
    let initialStep = this.props.step;

    if (initialStep !== null && !tabbedView) {
      initialStep = initialStep < 0 ? 0 : initialStep;
      initialStep =
        initialStep >= questionIds.length - 1
          ? questionIds.length - 1
          : initialStep;
      this.setState({ stepIndex: initialStep });
      scroller.scrollTo(`step${initialStep}`, { offset: -60 });
    }

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

  renderAutogradeSubmissionButton() {
    const {
      intl,
      graderView,
      submitted,
      handleAutogradeSubmission,
      isAutograding,
      isSaving,
    } = this.props;
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
  }

  renderExamDialog() {
    const { intl } = this.props;

    return (
      <Dialog open={this.state.examNotice} maxWidth="xl">
        <DialogTitle>
          {intl.formatMessage(translations.examDialogTitle)}
        </DialogTitle>
        <DialogContent>
          {intl.formatMessage(translations.examDialogMessage)}
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => this.setState({ examNotice: false })}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
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
  }

  renderGradingPanel() {
    const { attempting } = this.props;
    if (!attempting) {
      return <GradingPanel />;
    }
    return null;
  }

  renderMarkButton() {
    const {
      intl,
      delayedGradePublication,
      grading,
      graderView,
      submitted,
      handleMark,
      isSaving,
    } = this.props;
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
  }

  renderProgrammingQuestionActions(id) {
    const {
      intl,
      attempting,
      graderView,
      questions,
      questionsFlags,
      handleSubmitAnswer,
      isSaving,
    } = this.props;
    const question = questions[id];
    const { answerId, attemptsLeft, attemptLimit, autogradable } = question;
    const { jobError, isAutograding, isResetting } = questionsFlags[id] || {};

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
          {autogradable ? (
            <>
              <Button
                variant="contained"
                color="secondary"
                disabled={
                  isAutograding ||
                  isResetting ||
                  isSaving ||
                  (!graderView && attemptsLeft === 0)
                }
                id="run-code"
                onClick={() => handleSubmitAnswer(answerId)}
                style={styles.formButton}
              >
                {runCodeLabel}
              </Button>
            </>
          ) : null}
          {isAutograding || isResetting ? (
            <CircularProgress size={36} style={{ position: 'absolute' }} />
          ) : null}
        </>
      );
    }
    return null;
  }

  renderPublishButton() {
    const {
      intl,
      delayedGradePublication,
      graderView,
      grading,
      submitted,
      handlePublish,
      isSaving,
    } = this.props;
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
  }

  renderQuestionGrading(id) {
    const { attempting, published, graderView } = this.props;
    const editable = !attempting && graderView;
    const visible = editable || published;

    return visible ? <QuestionGrade id={id} editable={editable} /> : null;
  }

  renderQuestions() {
    const {
      intl,
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
    return (
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
                ? this.renderExplanationPanel(id)
                : null}
              {viewHistory ? null : this.renderQuestionGrading(id)}
              {viewHistory ? null : this.renderProgrammingQuestionActions(id)}
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
    const { intl, graderView, attempting, handleSaveGrade, isSaving } =
      this.props;
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
  }

  renderSubmitButton() {
    const { intl, canUpdate, attempting, isSaving } = this.props;
    if (attempting && canUpdate) {
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

  renderTabbedQuestions() {
    const { intl, questionIds } = this.props;

    return (
      <Tabs
        onChange={(event, value) => {
          this.setState({ stepIndex: value });
        }}
        style={{ backgroundColor: grey[100], color: blue[500] }}
        TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
        value={this.state.stepIndex}
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
  }

  renderTabbedQuestionsContent() {
    const {
      intl,
      attempting,
      questionIds,
      questions,
      questionsFlags,
      historyQuestions,
      topics,
      graderView,
      showMcqMrqSolution,
      handleToggleViewHistoryMode,
    } = this.props;

    const questionId = questionIds[this.state.stepIndex];
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
          ? this.renderExplanationPanel(questionId)
          : null}
        {viewHistory ? null : this.renderQuestionGrading(questionId)}
        {viewHistory ? null : this.renderProgrammingQuestionActions(questionId)}
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
  }

  renderUnmarkButton() {
    const { intl, graderView, graded, handleUnmark, isSaving } = this.props;
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
  }

  renderUnsubmitButton() {
    const { intl, graderView, submitted, published, isSaving } = this.props;
    if (graderView && (submitted || published)) {
      return (
        <Button
          variant="contained"
          color="secondary"
          disabled={isSaving}
          onClick={() => this.setState({ unsubmitConfirmation: true })}
          style={styles.formButton}
        >
          {intl.formatMessage(translations.unsubmit)}
        </Button>
      );
    }
    return null;
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
    const { tabbedView } = this.props;
    return (
      <Card style={styles.questionCardContainer}>
        <form>
          {tabbedView ? (
            <>
              {this.renderTabbedQuestions()}
              {this.renderTabbedQuestionsContent()}
            </>
          ) : (
            this.renderQuestions()
          )}
        </form>
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

        {this.renderNavigateAwayWarning()}
      </Card>
    );
  }
}

SubmissionEditForm.propTypes = {
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
  pristine: PropTypes.bool,

  handleAutogradeSubmission: PropTypes.func,
  handleSaveDraft: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleSubmitAnswer: PropTypes.func,
  handleReset: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleMark: PropTypes.func,
  handleUnmark: PropTypes.func,
  handlePublish: PropTypes.func,
  handleToggleViewHistoryMode: PropTypes.func,
};

export default reduxForm({
  form: formNames.SUBMISSION,
  validate: submissionFormValidate,
})(injectIntl(SubmissionEditForm));
