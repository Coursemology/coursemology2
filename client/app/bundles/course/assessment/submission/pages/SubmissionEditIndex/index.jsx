import { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import withHeartbeatWorker from 'workers/withHeartbeatWorker';

import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import withRouter from 'lib/components/navigation/withRouter';
import { getUrlParameter } from 'lib/helpers/url-helpers';

import assessmentsTranslations from '../../../translations';
import {
  autogradeSubmission,
  enterStudentView,
  exitStudentView,
  fetchSubmission,
  finalise,
  mark,
  publish,
  purgeSubmissionStore,
  unmark,
  unsubmit,
} from '../../actions';
import {
  fetchLiveFeedback,
  generateFeedback,
  generateLiveFeedback,
  initializeLiveFeedback,
  reevaluateAnswer,
  resetAnswer,
  saveAllAnswers,
  saveAllGrades,
  saveGrade,
  submitAnswer,
} from '../../actions/answers';
import ProgressPanel from '../../components/ProgressPanel';
import { workflowStates } from '../../constants';
import {
  answerShape,
  assessmentShape,
  explanationShape,
  gradingShape,
  historyQuestionShape,
  questionFlagsShape,
  questionShape,
  submissionShape,
  topicShape,
} from '../../propTypes';
import translations from '../../translations';

import BlockedSubmission from './BlockedSubmission';
import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import SubmissionEmptyForm from './SubmissionEmptyForm';
import TimeLimitBanner from './TimeLimitBanner';

class VisibleSubmissionEditIndex extends Component {
  constructor(props) {
    super(props);

    const stepString = getUrlParameter('step');
    const step =
      Number.isNaN(stepString) || stepString === ''
        ? null
        : parseInt(stepString, 10) - 1;

    this.state = { step };
  }

  componentDidMount() {
    const { dispatch, match, setSessionId } = this.props;
    dispatch(fetchSubmission(match.params.submissionId, setSessionId));
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(purgeSubmissionStore());
  }

  handleAutogradeSubmission = () => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(autogradeSubmission(params.submissionId));
  };

  handleMark = () => {
    const {
      dispatch,
      match: { params },
      grading,
      exp,
    } = this.props;
    dispatch(mark(params.submissionId, Object.values(grading), exp));
  };

  handlePublish = () => {
    const {
      dispatch,
      match: { params },
      grading,
      exp,
    } = this.props;
    dispatch(publish(params.submissionId, Object.values(grading), exp));
  };

  handleSaveAllGrades = () => {
    const {
      dispatch,
      match: { params },
      grading,
      exp,
      submission: { workflowState },
    } = this.props;
    const published = workflowState === workflowStates.Published;
    dispatch(
      saveAllGrades(
        params.submissionId,
        Object.values(grading),
        exp,
        published,
      ),
    );
  };

  handleSaveGrade = (id) => {
    const {
      dispatch,
      match: { params },
      grading,
      exp,
      submission: { workflowState },
    } = this.props;
    const published = workflowState === workflowStates.Published;
    dispatch(saveGrade(params.submissionId, grading[id], id, exp, published));
  };

  handleUnmark = () => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(unmark(params.submissionId));
  };

  handleUnsubmit = () => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(unsubmit(params.submissionId));
  };

  onReset = (answerId, setValue) => {
    const {
      answers,
      dispatch,
      match: { params },
    } = this.props;
    const questionId = answers.initial[answerId].questionId;
    dispatch(resetAnswer(params.submissionId, answerId, questionId, setValue));
  };

  onSaveDraft = (data, resetField) => {
    const { dispatch } = this.props;
    dispatch(saveAllAnswers(data, resetField));
  };

  onSubmit = (data) => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(finalise(params.submissionId, data));
  };

  onSubmitAnswer = (answerId, answer, resetField) => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(submitAnswer(params.submissionId, answerId, answer, resetField));
  };

  onReevaluateAnswer = (answerId, questionId) => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(reevaluateAnswer(params.submissionId, answerId, questionId));
  };

  onFetchLiveFeedback = (answerId, questionId) => {
    const {
      intl,
      dispatch,
      liveFeedback,
      assessment: { questionIds },
    } = this.props;

    const feedbackToken =
      liveFeedback?.feedbackByQuestion?.[questionId].pendingFeedbackToken;
    const questionIndex = questionIds.findIndex((id) => id === questionId) + 1;
    const successMessage = intl.formatMessage(
      translations.liveFeedbackSuccess,
      { questionIndex },
    );
    const noFeedbackMessage = intl.formatMessage(
      translations.liveFeedbackNoneGenerated,
      { questionIndex },
    );
    dispatch(
      fetchLiveFeedback({
        answerId,
        questionId,
        feedbackUrl: liveFeedback?.feedbackUrl,
        feedbackToken,
        successMessage,
        noFeedbackMessage,
      }),
    );
  };

  onGenerateFeedback = (answerId, questionId) => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(generateFeedback(params.submissionId, answerId, questionId));
  };

  onGenerateLiveFeedback = (answerId, questionId) => {
    const {
      dispatch,
      intl,
      assessment: { questionIds },
      match: { params },
    } = this.props;
    const questionIndex = questionIds.findIndex((id) => id === questionId) + 1;
    const successMessage = intl.formatMessage(
      translations.liveFeedbackSuccess,
      { questionIndex },
    );
    const noFeedbackMessage = intl.formatMessage(
      translations.liveFeedbackNoneGenerated,
      { questionIndex },
    );

    dispatch(initializeLiveFeedback(questionId));
    dispatch(
      generateLiveFeedback({
        submissionId: params.submissionId,
        answerId,
        questionId,
        successMessage,
        noFeedbackMessage,
      }),
    );
  };

  allConsideredCorrect() {
    const { explanations, questions } = this.props;
    if (Object.keys(explanations).length !== Object.keys(questions).length) {
      return false;
    }

    const numIncorrect = Object.keys(explanations).filter(
      (qid) => !explanations[qid] || !explanations[qid].correct,
    ).length;
    return numIncorrect === 0;
  }

  renderTimeLimitBanner() {
    const { assessment, submission, submissionTimeLimitAt } = this.props;

    return (
      assessment.timeLimit &&
      submission.workflowState === 'attempting' && (
        <TimeLimitBanner submissionTimeLimitAt={submissionTimeLimitAt} />
      )
    );
  }

  renderAssessment() {
    const { assessment, submission } = this.props;

    const renderFile = (file, index) => (
      <div key={index}>
        <InsertDriveFile style={{ verticalAlign: 'middle' }} />
        <Link href={file.url} opensInNewTab>
          {file.name}
        </Link>
      </div>
    );

    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={assessment.title} />
        {assessment.description && (
          <CardContent>
            <Typography
              dangerouslySetInnerHTML={{ __html: assessment.description }}
              variant="body2"
            />
          </CardContent>
        )}
        {assessment.files?.length > 0 && (
          <CardContent>
            <Typography variant="h6">Files</Typography>
            {assessment.files.map(renderFile)}
          </CardContent>
        )}
        <CardActions>
          {submission.isGrader && this.renderStudentViewToggle()}
        </CardActions>
      </Card>
    );
  }

  renderContent() {
    const { step } = this.state;
    const {
      answers,
      assessment: {
        autograded,
        delayedGradePublication,
        tabbedView,
        skippable,
        questionIds,
        passwordProtected,
        allowPartialSubmission,
        showMcqAnswer,
        showMcqMrqSolution,
        isCodaveriEnabled,
      },
      codaveriFeedbackStatus,
      submissionTimeLimitAt,
      submission: { graderView, canUpdate, maxStep, workflowState },
      explanations,
      grading,
      questions,
      historyQuestions,
      questionsFlags,
      topics,
      isAutograding,
      isSaving,
    } = this.props;

    if (Object.values(questions).length === 0) {
      return (
        <SubmissionEmptyForm
          attempting={workflowState === workflowStates.Attempting}
          canUpdate={canUpdate}
          graderView={graderView}
          handleSaveAllGrades={this.handleSaveAllGrade}
          handleUnsubmit={this.handleUnsubmit}
          isSaving={isSaving}
          onSubmit={this.onSubmit}
          published={workflowState === workflowStates.Published}
          submitted={workflowState === workflowStates.Submitted}
        />
      );
    }

    if (autograded) {
      return (
        <SubmissionEditStepForm
          allConsideredCorrect={this.allConsideredCorrect()}
          allowPartialSubmission={allowPartialSubmission}
          attempting={workflowState === workflowStates.Attempting}
          codaveriFeedbackStatus={codaveriFeedbackStatus}
          explanations={explanations}
          graderView={graderView}
          handleSaveAllGrades={this.handleSaveAllGrades}
          handleSaveGrade={this.handleSaveGrade}
          handleUnsubmit={this.handleUnsubmit}
          historyQuestions={historyQuestions}
          initialValues={answers.initial}
          isCodaveriEnabled={isCodaveriEnabled}
          isSaving={isSaving}
          maxStep={maxStep === undefined ? questionIds.length - 1 : maxStep}
          onFetchLiveFeedback={this.onFetchLiveFeedback}
          onGenerateFeedback={this.onGenerateFeedback}
          onGenerateLiveFeedback={this.onGenerateLiveFeedback}
          onReevaluateAnswer={this.onReevaluateAnswer}
          onReset={this.onReset}
          onSaveDraft={this.onSaveDraft}
          onSubmit={this.onSubmit}
          onSubmitAnswer={this.onSubmitAnswer}
          published={workflowState === workflowStates.Published}
          questionIds={questionIds}
          questions={questions}
          questionsFlags={questionsFlags}
          showMcqAnswer={showMcqAnswer}
          showMcqMrqSolution={showMcqMrqSolution}
          skippable={skippable}
          step={step}
          submissionTimeLimitAt={submissionTimeLimitAt}
          submitted={workflowState === workflowStates.Submitted}
          topics={topics}
        />
      );
    }
    return (
      <SubmissionEditForm
        attempting={workflowState === workflowStates.Attempting}
        canUpdate={canUpdate}
        codaveriFeedbackStatus={codaveriFeedbackStatus}
        delayedGradePublication={delayedGradePublication}
        explanations={explanations}
        graded={workflowState === workflowStates.Graded}
        graderView={graderView}
        grading={grading}
        handleAutogradeSubmission={this.handleAutogradeSubmission}
        handleMark={this.handleMark}
        handlePublish={this.handlePublish}
        handleSaveAllGrades={this.handleSaveAllGrades}
        handleSaveGrade={this.handleSaveGrade}
        handleUnmark={this.handleUnmark}
        handleUnsubmit={this.handleUnsubmit}
        historyQuestions={historyQuestions}
        initialValues={answers.initial}
        isAutograding={isAutograding}
        isCodaveriEnabled={isCodaveriEnabled}
        isSaving={isSaving}
        maxStep={maxStep === undefined ? questionIds.length - 1 : maxStep}
        onFetchLiveFeedback={this.onFetchLiveFeedback}
        onGenerateFeedback={this.onGenerateFeedback}
        onGenerateLiveFeedback={this.onGenerateLiveFeedback}
        onReevaluateAnswer={this.onReevaluateAnswer}
        onReset={this.onReset}
        onSaveDraft={this.onSaveDraft}
        onSubmit={this.onSubmit}
        onSubmitAnswer={this.onSubmitAnswer}
        passwordProtected={passwordProtected}
        published={workflowState === workflowStates.Published}
        questionIds={questionIds}
        questions={questions}
        questionsFlags={questionsFlags}
        showMcqMrqSolution={showMcqMrqSolution}
        step={step}
        submissionTimeLimitAt={submissionTimeLimitAt}
        submitted={workflowState === workflowStates.Submitted}
        tabbedView={tabbedView}
        topics={topics}
      />
    );
  }

  renderProgress() {
    const { submission } = this.props;
    if (submission.graderView) {
      return <ProgressPanel submission={submission} />;
    }
    return null;
  }

  renderStudentViewToggle() {
    return (
      <FormControlLabel
        control={
          <Switch
            className="toggle-phantom"
            color="primary"
            onChange={(_, enabled) => {
              if (enabled) {
                this.props.dispatch(enterStudentView());
              } else {
                this.props.dispatch(exitStudentView());
              }
            }}
          />
        }
        label={
          <b>
            <FormattedMessage {...translations.studentView} />
          </b>
        }
        labelPlacement="end"
        style={{ marginLeft: '0.5px' }}
      />
    );
  }

  render() {
    const { isSubmissionBlocked, isLoading } = this.props;

    if (isLoading) return <LoadingIndicator />;
    if (isSubmissionBlocked) return <BlockedSubmission />;
    return (
      <Page className="space-y-5">
        {this.renderTimeLimitBanner()}
        {this.renderAssessment()}
        {this.renderProgress()}
        {this.renderContent()}
      </Page>
    );
  }
}

VisibleSubmissionEditIndex.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string,
      assessmentId: PropTypes.string,
      submissionId: PropTypes.string,
    }),
  }),
  answers: PropTypes.object,
  assessment: assessmentShape,
  codaveriFeedbackStatus: PropTypes.object,
  submissionTimeLimitAt: PropTypes.number,
  exp: PropTypes.number,
  explanations: PropTypes.objectOf(explanationShape),
  liveFeedback: PropTypes.object,
  grading: gradingShape.isRequired,
  questions: PropTypes.objectOf(questionShape),
  historyAnswers: PropTypes.objectOf(answerShape),
  historyQuestions: PropTypes.objectOf(historyQuestionShape),
  intl: PropTypes.object.isRequired,
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  submission: submissionShape,
  topics: PropTypes.objectOf(topicShape),
  isAutograding: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isSubmissionBlocked: PropTypes.bool,
  setSessionId: PropTypes.func,
};

function mapStateToProps({ assessments: { submission } }) {
  const hasSubmissionTimeLimit =
    submission.submission.workflowState === workflowStates.Attempting &&
    submission.assessment.timeLimit;
  const submissionTimeLimitAt = hasSubmissionTimeLimit
    ? new Date(submission.submission.attemptedAt).getTime() +
      submission.assessment.timeLimit * 60 * 1000
    : null;

  return {
    assessment: submission.assessment,
    submissionTimeLimitAt,
    exp: submission.grading.exp,
    explanations: submission.explanations,
    answers: submission.answers,
    codaveriFeedbackStatus: submission.codaveriFeedbackStatus,
    grading: submission.grading.questions,
    submission: submission.submission,
    liveFeedback: submission.liveFeedback,
    questions: submission.questions,
    historyAnswers: submission.history.answers,
    historyQuestions: submission.history.questions,
    questionsFlags: submission.questionsFlags,
    isAutograding: submission.submissionFlags.isAutograding,
    topics: submission.topics,
    isLoading: submission.submissionFlags.isLoading,
    isSaving: submission.submissionFlags.isSaving,
    isSubmissionBlocked: submission.submissionFlags.isSubmissionBlocked,
  };
}

const handle = assessmentsTranslations.attempt;

const SubmissionEditIndex = withRouter(
  withHeartbeatWorker(
    connect(mapStateToProps)(injectIntl(VisibleSubmissionEditIndex)),
  ),
);

export default Object.assign(SubmissionEditIndex, { handle });
