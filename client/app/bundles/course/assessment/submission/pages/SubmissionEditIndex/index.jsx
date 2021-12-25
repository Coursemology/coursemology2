import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FileIcon from 'material-ui/svg-icons/editor/insert-drive-file';
import Toggle from 'material-ui/Toggle';
import PropTypes from 'prop-types';
import { touch } from 'redux-form';

import { setNotification } from 'lib/actions';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import { getUrlParameter } from 'lib/helpers/url-helpers';

import {
  autogradeSubmission,
  enterStudentView,
  exitStudentView,
  fetchSubmission,
  finalise,
  mark,
  publish,
  resetAnswer,
  saveDraft,
  saveGrade,
  submitAnswer,
  toggleViewHistoryMode,
  unmark,
  unsubmit,
} from '../../actions';
import ProgressPanel from '../../components/ProgressPanel';
import { formNames, workflowStates } from '../../constants';
import {
  answerShape,
  assessmentShape,
  explanationShape,
  gradingShape,
  historyQuestionShape,
  postShape,
  questionFlagsShape,
  questionShape,
  reduxFormShape,
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

  handleReset(answerId) {
    const {
      dispatch,
      form,
      match: { params },
    } = this.props;
    const questionId = form.values[answerId].questionId;
    dispatch(resetAnswer(params.submissionId, answerId, questionId));
  }

  handleSaveDraft() {
    const {
      dispatch,
      form,
      match: { params },
    } = this.props;
    const answers = Object.values(form.values);
    dispatch(saveDraft(params.submissionId, answers));
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

  handleSubmit() {
    const {
      dispatch,
      form,
      match: { params },
    } = this.props;
    const answers = Object.values(form.values);
    return this.validateSubmit().then(
      () => dispatch(finalise(params.submissionId, answers)),
      () => setNotification(translations.submitError)(dispatch),
    );
  }

  handleSubmitAnswer(answerId) {
    const {
      dispatch,
      form,
      match: { params },
    } = this.props;
    const answer = form.values[answerId] || {};
    return this.validateSubmitAnswer(answerId).then(
      () => dispatch(submitAnswer(params.submissionId, answer)),
      () => setNotification(translations.submitError)(dispatch),
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

  validateSubmit = () => {
    const { dispatch, form } = this.props;
    const answers = Object.values(form.values);
    /**
     * Assume there are syncErrors in the form initially.
     * If the user did not change any field, and press submit button directly,
     * all the fields will not be touched, hence, errors will no be shown.
     * Therefore we need to manually touch all the fields
     */
    answers.forEach((answer = {}) => {
      const answerId = answer.id;
      Object.keys(answer).forEach((key) => {
        dispatch(touch(formNames.SUBMISSION, `${answerId}.${key}`));
      });
    });

    const hasError = Object.values(form.syncErrors || {}).some(
      (answerError) => Object.keys(answerError).length !== 0,
    );

    if (hasError) {
      return Promise.reject();
    }
    return Promise.resolve();
  };

  validateSubmitAnswer = (answerId) => {
    const { dispatch, form } = this.props;
    const answer = form.values[answerId] || {};
    const answerError = form.syncErrors && form.syncErrors[answerId];
    /**
     * Similar reason to validateSubmit.
     * If the user did not change any field, and press submit button directly, we need to manually
     * touch all the fields of the answer, in order to show the syncErrors.
     */
    Object.keys(answer || {}).forEach((key) => {
      dispatch(touch(formNames.SUBMISSION, `${answerId}.${key}`));
    });

    if (Object.keys(answerError || {}).length !== 0) {
      return Promise.reject();
    }
    return Promise.resolve();
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
        <FileIcon style={{ verticalAlign: 'middle' }} />
        <a href={file.url}>
          <span>{file.name}</span>
        </a>
      </div>
    );

    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={<h3>{assessment.title}</h3>} />
        {assessment.description ? (
          <CardText
            dangerouslySetInnerHTML={{ __html: assessment.description }}
          />
        ) : null}
        {assessment.files.length > 0 ? (
          <CardText>
            <h4>Files</h4>
            {assessment.files.map(renderFile)}
          </CardText>
        ) : null}
        <CardActions>
          {submission.isGrader && this.renderStudentViewToggle()}
        </CardActions>
      </Card>
    );
  }

  renderContent() {
    const { newSubmission, step } = this.state;
    const {
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
          handleSubmit={() => this.handleSubmit()}
          handleUnsubmit={() => this.handleUnsubmit()}
          isSaving={isSaving}
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
          handleAutogradeSubmission={() => this.handleAutogradeSubmission()}
          handleReset={(answerId) => this.handleReset(answerId)}
          handleSaveDraft={() => this.handleSaveDraft()}
          handleSaveGrade={() => this.handleSaveGrade()}
          handleSubmit={() => this.handleSubmit()}
          handleSubmitAnswer={(answerId) => this.handleSubmitAnswer(answerId)}
          handleToggleViewHistoryMode={this.handleToggleViewHistoryMode}
          handleUnsubmit={() => this.handleUnsubmit()}
          historyQuestions={historyQuestions}
          isSaving={isSaving}
          maxStep={maxStep === undefined ? questionIds.length - 1 : maxStep}
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
        handleReset={(answerId) => this.handleReset(answerId)}
        handleSaveDraft={() => this.handleSaveDraft()}
        handleSaveGrade={() => this.handleSaveGrade()}
        handleSubmit={() => this.handleSubmit()}
        handleSubmitAnswer={(answerId) => this.handleSubmitAnswer(answerId)}
        handleToggleViewHistoryMode={this.handleToggleViewHistoryMode}
        handleUnmark={() => this.handleUnmark()}
        handleUnsubmit={() => this.handleUnsubmit()}
        historyQuestions={historyQuestions}
        isAutograding={isAutograding}
        isSaving={isSaving}
        newSubmission={newSubmission}
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
      <Toggle
        label={<FormattedMessage {...translations.studentView} />}
        labelPosition="right"
        onToggle={(_, enabled) => {
          if (enabled) {
            this.props.dispatch(enterStudentView());
          } else {
            this.props.dispatch(exitStudentView());
          }
        }}
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
  assessment: assessmentShape,
  exp: PropTypes.number,
  explanations: PropTypes.objectOf(explanationShape),
  form: reduxFormShape,
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
    form: state.form[formNames.SUBMISSION],
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

const SubmissionEditIndex = connect(mapStateToProps)(
  VisibleSubmissionEditIndex,
);
export default SubmissionEditIndex;
