import { Component, lazy, Suspense } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Element, scroller } from 'react-scroll';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {
  blue500,
  grey100,
  red100,
  red200,
  red900,
  white,
  yellow900,
} from 'material-ui/styles/colors';
import { Tab, Tabs } from 'material-ui/Tabs';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import SubmissionAnswer from '../../components/SubmissionAnswer';
import { formNames, questionTypes } from '../../constants';
import GradingPanel from '../../containers/GradingPanel';
import QuestionGrade from '../../containers/QuestionGrade';
import {
  explanationShape,
  historyQuestionShape,
  questionFlagsShape,
  questionGradeShape,
  questionShape,
  topicShape,
} from '../../propTypes';
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
      scroller.scrollTo(`step${initialStep}`, { offset: -60 });
    }
  }

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
        <RaisedButton
          disabled={isSaving || isAutograding}
          icon={isAutograding ? progressIcon : null}
          label={intl.formatMessage(translations.autograde)}
          onClick={handleAutogradeSubmission}
          primary={true}
          style={styles.formButton}
        />
      );
    }
    return null;
  }

  renderExamDialog() {
    const { intl } = this.props;

    return (
      <Dialog
        actions={
          <FlatButton
            label="OK"
            onClick={() => this.setState({ examNotice: false })}
            primary={true}
          />
        }
        modal={true}
        open={this.state.examNotice}
        title={intl.formatMessage(translations.examDialogTitle)}
      >
        {intl.formatMessage(translations.examDialogMessage)}
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
              backgroundColor: red200,
            }}
            title={title}
            titleColor={red900}
          />
          {explanation.explanations.every(
            (exp) => exp.trim().length === 0,
          ) ? null : (
            <CardText>
              {explanation.explanations.map((exp, index) => {
                const key = `question-${questionId}-explanation-${index}`;
                return (
                  <div key={key} dangerouslySetInnerHTML={{ __html: exp }} />
                );
              })}
            </CardText>
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
        <RaisedButton
          backgroundColor={yellow900}
          disabled={isSaving || anyUngraded}
          label={intl.formatMessage(translations.mark)}
          labelColor={white}
          onClick={handleMark}
          style={styles.formButton}
        />
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
              style={{ padding: 10, backgroundColor: red100, marginBottom: 20 }}
            >
              {intl.formatMessage(translations.autogradeFailure)}
            </Paper>
          ) : null}
          <RaisedButton
            backgroundColor={white}
            disabled={isAutograding || isResetting || isSaving}
            label={intl.formatMessage(translations.reset)}
            onClick={() =>
              this.setState({
                resetConfirmation: true,
                resetAnswerId: answerId,
              })
            }
            style={styles.formButton}
          />
          {autogradable ? (
            <RaisedButton
              backgroundColor={red900}
              disabled={
                isAutograding ||
                isResetting ||
                isSaving ||
                (!graderView && attemptsLeft === 0)
              }
              id="run-code"
              label={runCodeLabel}
              onClick={() => handleSubmitAnswer(answerId)}
              secondary={true}
              style={styles.formButton}
            />
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
        <RaisedButton
          backgroundColor={red900}
          disabled={isSaving || anyUngraded}
          label={intl.formatMessage(translations.publish)}
          onClick={handlePublish}
          secondary={true}
          style={styles.formButton}
        />
      );
    }
    return null;
  }

  renderQuestionGrading(id) {
    const { attempting, published, graderView } = this.props;
    const editable = !attempting && graderView;
    const visible = editable || published;

    return visible ? <QuestionGrade editable={editable} id={id} /> : null;
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
              key={id}
              name={`step${index}`}
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
        message={intl.formatMessage(translations.resetConfirmation)}
        onCancel={() =>
          this.setState({ resetConfirmation: false, resetAnswerId: null })
        }
        onConfirm={() => {
          this.setState({ resetConfirmation: false, resetAnswerId: null });
          handleReset(resetAnswerId);
        }}
        open={resetConfirmation}
      />
    );
  }

  renderSaveDraftButton() {
    const { intl, pristine, attempting, handleSaveDraft, isSaving } =
      this.props;
    if (attempting) {
      return (
        <RaisedButton
          disabled={pristine || isSaving}
          label={intl.formatMessage(translations.saveDraft)}
          onClick={handleSaveDraft}
          primary={true}
          style={styles.formButton}
        />
      );
    }
    return null;
  }

  renderSaveGradeButton() {
    const { intl, graderView, attempting, handleSaveGrade, isSaving } =
      this.props;
    if (graderView && !attempting) {
      return (
        <RaisedButton
          disabled={isSaving}
          label={intl.formatMessage(translations.saveGrade)}
          onClick={handleSaveGrade}
          primary={true}
          style={styles.formButton}
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
          disabled={isSaving}
          label={intl.formatMessage(translations.finalise)}
          onClick={() => this.setState({ submitConfirmation: true })}
          secondary={true}
          style={styles.formButton}
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
        message={intl.formatMessage(translations.submitConfirmation)}
        onCancel={() => this.setState({ submitConfirmation: false })}
        onConfirm={() => {
          this.setState({ submitConfirmation: false });
          handleSubmit();
        }}
        open={submitConfirmation}
      />
    );
  }

  renderTabbedQuestions() {
    const {
      intl,
      attempting,
      questionIds,
      questions,
      questionsFlags,
      historyQuestions,
      topics,
      step,
      graderView,
      showMcqMrqSolution,
      handleToggleViewHistoryMode,
    } = this.props;

    let initialStep = step || 0;
    initialStep = initialStep < 0 ? 0 : initialStep;
    initialStep =
      initialStep >= questionIds.length - 1
        ? questionIds.length - 1
        : initialStep;

    return (
      <Tabs
        initialSelectedIndex={initialStep}
        inkBarStyle={{ backgroundColor: blue500, height: 5, marginTop: -5 }}
        tabItemContainerStyle={{ backgroundColor: grey100 }}
      >
        {questionIds.map((id, index) => {
          const question = questions[id];
          const { answerId, topicId, viewHistory } = question;
          const topic = topics[topicId];
          return (
            <Tab
              key={id}
              buttonStyle={{ color: blue500 }}
              label={intl.formatMessage(translations.questionNumber, {
                number: index + 1,
              })}
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
            </Tab>
          );
        })}
      </Tabs>
    );
  }

  renderUnmarkButton() {
    const { intl, graderView, graded, handleUnmark, isSaving } = this.props;
    if (graderView && graded) {
      return (
        <RaisedButton
          backgroundColor={yellow900}
          disabled={isSaving}
          label={intl.formatMessage(translations.unmark)}
          labelColor={white}
          onClick={handleUnmark}
          style={styles.formButton}
        />
      );
    }
    return null;
  }

  renderUnsubmitButton() {
    const { intl, graderView, submitted, published, isSaving } = this.props;
    if (graderView && (submitted || published)) {
      return (
        <RaisedButton
          backgroundColor={red900}
          disabled={isSaving}
          label={intl.formatMessage(translations.unsubmit)}
          onClick={() => this.setState({ unsubmitConfirmation: true })}
          secondary={true}
          style={styles.formButton}
        />
      );
    }
    return null;
  }

  renderUnsubmitDialog() {
    const { unsubmitConfirmation } = this.state;
    const { intl, handleUnsubmit } = this.props;
    return (
      <ConfirmationDialog
        message={intl.formatMessage(translations.unsubmitConfirmation)}
        onCancel={() => this.setState({ unsubmitConfirmation: false })}
        onConfirm={() => {
          this.setState({ unsubmitConfirmation: false });
          handleUnsubmit();
        }}
        open={unsubmitConfirmation}
      />
    );
  }

  render() {
    const { tabbedView } = this.props;
    return (
      <Card style={styles.questionCardContainer}>
        <form>
          {tabbedView ? this.renderTabbedQuestions() : this.renderQuestions()}
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

        {this.state.submitConfirmation && this.renderSubmitDialog()}
        {this.state.unsubmitConfirmation && this.renderUnsubmitDialog()}
        {this.state.resetConfirmation && this.renderResetDialog()}
        {this.renderExamDialog()}
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
