import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
} from '@mui/material';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import NotificationBar, {
  notificationShape,
} from 'lib/components/core/NotificationBar';
import withRouter from 'lib/components/navigation/withRouter';
import { getUrlParameter } from 'lib/helpers/url-helpers';

import {
  autogradeSubmission,
  enterStudentView,
  exitStudentView,
  fetchSubmission,
  finalise,
  mark,
  publish,
  reevaluateAnswer,
  resetAnswer,
  saveDraft,
  saveGrade,
  submitAnswer,
  toggleViewHistoryMode,
  unmark,
  unsubmit,
} from '../../actions';
import ProgressPanel from '../../components/ProgressPanel';
import { workflowStates } from '../../constants';
import {
  answerShape,
  assessmentShape,
  explanationShape,
  gradingShape,
  historyQuestionShape,
  postShape,
  questionFlagsShape,
  questionShape,
  submissionShape,
  topicShape,
} from '../../propTypes';
import translations from '../../translations';

import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import SubmissionEmptyForm from './SubmissionEmptyForm';

class VisibleSubmissionEditIndex extends Component {
  constructor(props) {
    super(props);

    const newSubmission =
      !!getUrlParameter('new_submission') &&
      getUrlParameter('new_submission') === 'true';
    const stepString = getUrlParameter('step');
    const step =
      Number.isNaN(stepString) || stepString === ''
        ? null
        : parseInt(stepString, 10) - 1;

    this.state = { newSubmission, step };
  }

  componentDidMount() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(fetchSubmission(params.submissionId));
  }

  handleAutogradeSubmission() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(autogradeSubmission(params.submissionId));
  }

  handleMark() {
    const {
      dispatch,
      match: { params },
      grading,
      exp,
    } = this.props;
    dispatch(mark(params.submissionId, Object.values(grading), exp));
  }

  handlePublish() {
    const {
      dispatch,
      match: { params },
      grading,
      exp,
    } = this.props;
    dispatch(publish(params.submissionId, Object.values(grading), exp));
  }

  handleSaveGrade() {
    const {
      dispatch,
      match: { params },
      grading,
      exp,
      submission: { workflowState },
    } = this.props;
    const published = workflowState === workflowStates.Published;
    dispatch(
      saveGrade(params.submissionId, Object.values(grading), exp, published),
    );
  }

  handleToggleViewHistoryMode = (
    viewHistory,
    submissionQuestionId,
    questionId,
  ) => {
    const { dispatch, historyQuestions } = this.props;
    const answersLoaded = historyQuestions[questionId].pastAnswersLoaded;
    dispatch(
      toggleViewHistoryMode(
        viewHistory,
        submissionQuestionId,
        questionId,
        answersLoaded,
      ),
    );
  };

  handleUnmark() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(unmark(params.submissionId));
  }

  handleUnsubmit() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(unsubmit(params.submissionId));
  }

  onReset = (answerId, setValue) => {
    const {
      answers,
      dispatch,
      match: { params },
    } = this.props;
    const questionId = answers.initial[answerId].questionId;
    dispatch(resetAnswer(params.submissionId, answerId, questionId, setValue));
  };

  onSaveDraft = (data) => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(saveDraft(params.submissionId, data));
  };

  onSubmit = (data) => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(finalise(params.submissionId, data));
  };

  onSubmitAnswer = (answerId, answer, setValue) => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(submitAnswer(params.submissionId, answerId, answer, setValue));
  };

  onReevaluateAnswer = (answerId, questionId) => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch(reevaluateAnswer(params.submissionId, answerId, questionId));
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

  renderAssessment() {
    const { assessment, submission } = this.props;

    const renderFile = (file, index) => (
      <div key={index}>
        <InsertDriveFile style={{ verticalAlign: 'middle' }} />
        <a href={file.url}>
          <span>{file.name}</span>
        </a>
      </div>
    );

    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={<h3>{assessment.title}</h3>} />
        {assessment.description ? (
          <CardContent
            dangerouslySetInnerHTML={{ __html: assessment.description }}
          />
        ) : null}
        {assessment.files.length > 0 && (
          <CardContent>
            <h4>Files</h4>
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
    const { newSubmission, step } = this.state;
    const {
      answers,
      assessment: {
        autograded,
        delayedGradePublication,
        tabbedView,
        skippable,
        questionIds,
        passwordProtected,
        categoryId,
        tabId,
        allowPartialSubmission,
        showMcqAnswer,
        showMcqMrqSolution,
      },
      submission: { graderView, canUpdate, maxStep, workflowState },
      explanations,
      grading,
      posts,
      questions,
      historyQuestions,
      questionsFlags,
      topics,
      isAutograding,
      isSaving,
      match: {
        params: { courseId },
      },
    } = this.props;

    if (Object.values(questions).length === 0) {
      return (
        <SubmissionEmptyForm
          attempting={workflowState === workflowStates.Attempting}
          canUpdate={canUpdate}
          categoryId={categoryId}
          courseId={courseId}
          graderView={graderView}
          handleSaveGrade={() => this.handleSaveGrade()}
          handleUnsubmit={() => this.handleUnsubmit()}
          isSaving={isSaving}
          onSubmit={() => this.onSubmit()}
          published={workflowState === workflowStates.Published}
          submitted={workflowState === workflowStates.Submitted}
          tabId={tabId}
        />
      );
    }

    if (autograded) {
      return (
        <SubmissionEditStepForm
          allConsideredCorrect={this.allConsideredCorrect()}
          allowPartialSubmission={allowPartialSubmission}
          attempting={workflowState === workflowStates.Attempting}
          explanations={explanations}
          graderView={graderView}
          handleSaveGrade={() => this.handleSaveGrade()}
          handleToggleViewHistoryMode={this.handleToggleViewHistoryMode}
          handleUnsubmit={() => this.handleUnsubmit()}
          historyQuestions={historyQuestions}
          initialValues={answers.initial}
          isSaving={isSaving}
          maxStep={maxStep === undefined ? questionIds.length - 1 : maxStep}
          onReevaluateAnswer={this.onReevaluateAnswer}
          onReset={this.onReset}
          onSaveDraft={this.onSaveDraft}
          onSubmit={this.onSubmit}
          onSubmitAnswer={this.onSubmitAnswer}
          posts={posts}
          published={workflowState === workflowStates.Published}
          questionIds={questionIds}
          questions={questions}
          questionsFlags={questionsFlags}
          showMcqAnswer={showMcqAnswer}
          showMcqMrqSolution={showMcqMrqSolution}
          skippable={skippable}
          step={step}
          submitted={workflowState === workflowStates.Submitted}
          topics={topics}
        />
      );
    }
    return (
      <SubmissionEditForm
        attempting={workflowState === workflowStates.Attempting}
        canUpdate={canUpdate}
        delayedGradePublication={delayedGradePublication}
        explanations={explanations}
        graded={workflowState === workflowStates.Graded}
        graderView={graderView}
        grading={grading}
        handleAutogradeSubmission={() => this.handleAutogradeSubmission()}
        handleMark={() => this.handleMark()}
        handlePublish={() => this.handlePublish()}
        handleSaveGrade={() => this.handleSaveGrade()}
        handleToggleViewHistoryMode={this.handleToggleViewHistoryMode}
        handleUnmark={() => this.handleUnmark()}
        handleUnsubmit={() => this.handleUnsubmit()}
        historyQuestions={historyQuestions}
        initialValues={answers.initial}
        isAutograding={isAutograding}
        isSaving={isSaving}
        maxStep={maxStep === undefined ? questionIds.length - 1 : maxStep}
        newSubmission={newSubmission}
        onReevaluateAnswer={this.onReevaluateAnswer}
        onReset={this.onReset}
        onSaveDraft={this.onSaveDraft}
        onSubmit={this.onSubmit}
        onSubmitAnswer={this.onSubmitAnswer}
        passwordProtected={passwordProtected}
        posts={posts}
        published={workflowState === workflowStates.Published}
        questionIds={questionIds}
        questions={questions}
        questionsFlags={questionsFlags}
        showMcqMrqSolution={showMcqMrqSolution}
        step={step}
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
    const { isLoading, notification } = this.props;

    if (isLoading) {
      return <LoadingIndicator />;
    }
    return (
      <>
        {this.renderAssessment()}
        {this.renderProgress()}
        {this.renderContent()}
        <NotificationBar notification={notification} />
      </>
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
  exp: PropTypes.number,
  explanations: PropTypes.objectOf(explanationShape),
  grading: gradingShape.isRequired,
  notification: notificationShape,
  posts: PropTypes.objectOf(postShape),
  questions: PropTypes.objectOf(questionShape),
  historyAnswers: PropTypes.objectOf(answerShape),
  historyQuestions: PropTypes.objectOf(historyQuestionShape),
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  submission: submissionShape,
  topics: PropTypes.objectOf(topicShape),
  isAutograding: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    assessment: state.assessment,
    exp: state.grading.exp,
    explanations: state.explanations,
    answers: state.answers,
    grading: state.grading.questions,
    notification: state.notification,
    posts: state.posts,
    submission: state.submission,
    questions: state.questions,
    historyAnswers: state.history.answers,
    historyQuestions: state.history.questions,
    questionsFlags: state.questionsFlags,
    isAutograding: state.submissionFlags.isAutograding,
    topics: state.topics,
    isLoading: state.submissionFlags.isLoading,
    isSaving: state.submissionFlags.isSaving,
  };
}

const SubmissionEditIndex = withRouter(
  connect(mapStateToProps)(VisibleSubmissionEditIndex),
);
export default SubmissionEditIndex;
