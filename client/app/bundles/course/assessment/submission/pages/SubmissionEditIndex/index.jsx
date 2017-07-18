import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import IntlNotificationBar, { notificationShape } from 'lib/components/IntlNotificationBar';
import ProgressPanel from '../../components/ProgressPanel';
import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import {
  fetchSubmission, autogradeSubmission, saveDraft, finalise,
  unsubmit, autogradeAnswer, resetAnswer, saveGrade, mark, unmark, publish,
} from '../../actions';
import {
  AnswerProp, AssessmentProp, ExplanationProp, GradingProp, PostProp,
  QuestionFlagsProp, QuestionProp, ReduxFormProp, SubmissionProp, TopicProp,
} from '../../propTypes';
import { formNames, workflowStates } from '../../constants';

class VisibleSubmissionEditIndex extends Component {
  componentDidMount() {
    const { dispatch, match: { params } } = this.props;
    dispatch(fetchSubmission(params.submissionId));
  }

  allCorrect() {
    const { explanations, questions } = this.props;
    if (Object.keys(explanations).length !== Object.keys(questions).length) {
      return false;
    }

    const numIncorrect = Object.keys(explanations).filter(
      qid => !explanations[qid] || !explanations[qid].correct
    ).length;
    return numIncorrect === 0;
  }

  handleAutogradeSubmission() {
    const { dispatch, match: { params } } = this.props;
    dispatch(autogradeSubmission(params.submissionId));
  }

  handleSubmit() {
    const { dispatch, form, match: { params } } = this.props;
    const answers = Object.values(form.values);
    dispatch(finalise(params.submissionId, answers));
  }

  handleUnsubmit() {
    const { dispatch, match: { params } } = this.props;
    dispatch(unsubmit(params.submissionId));
  }

  handleSaveDraft() {
    const { dispatch, form, match: { params } } = this.props;
    const answers = Object.values(form.values);
    dispatch(saveDraft(params.submissionId, answers));
  }

  handleSaveGrade() {
    const { dispatch, match: { params }, grading, exp,
            submission: { workflowState } } = this.props;
    const published = workflowState === workflowStates.Published;
    dispatch(saveGrade(params.submissionId, Object.values(grading), exp, published));
  }

  handleReset(answerId) {
    const { dispatch, form, match: { params } } = this.props;
    const questionId = form.values[answerId].questionId;
    dispatch(resetAnswer(params.submissionId, answerId, questionId));
  }

  handleAutograde(answerId) {
    const { dispatch, form, match: { params } } = this.props;
    const answers = [form.values[answerId]];
    dispatch(autogradeAnswer(params.submissionId, answers));
  }

  handleMark() {
    const { dispatch, match: { params }, grading, exp } = this.props;
    dispatch(mark(params.submissionId, Object.values(grading), exp));
  }

  handleUnmark() {
    const { dispatch, match: { params } } = this.props;
    dispatch(unmark(params.submissionId));
  }

  handlePublish() {
    const { dispatch, match: { params }, grading, exp } = this.props;
    dispatch(publish(params.submissionId, Object.values(grading), exp));
  }

  renderProgress() {
    const { submission } = this.props;
    if (submission.canGrade) {
      return <ProgressPanel submission={submission} />;
    }
    return null;
  }

  renderContent() {
    const {
      assessment: { autograded, delayedGradePublication, tabbedView, skippable, questionIds },
      submission: { canGrade, canUpdate, maxStep, workflowState },
      answers,
      explanations,
      posts,
      questions,
      questionsFlags,
      topics,
      isSaving,
    } = this.props;

    if (autograded) {
      return (
        <SubmissionEditStepForm
          enableReinitialize
          handleSaveDraft={() => this.handleSaveDraft()}
          handleSaveGrade={() => this.handleSaveGrade()}
          handleSubmit={() => this.handleSubmit()}
          handleUnsubmit={() => this.handleUnsubmit()}
          handleAutograde={answerId => this.handleAutograde(answerId)}
          handleReset={answerId => this.handleReset(answerId)}
          handleAutogradeSubmission={() => this.handleAutogradeSubmission()}
          initialValues={answers}
          explanations={explanations}
          allCorrect={this.allCorrect()}
          canGrade={canGrade}
          attempting={workflowState === workflowStates.Attempting}
          submitted={workflowState === workflowStates.Submitted}
          maxStep={maxStep}
          skippable={skippable}
          posts={posts}
          questionIds={questionIds}
          questions={questions}
          questionsFlags={questionsFlags}
          topics={topics}
          isSaving={isSaving}
        />
      );
    }
    return (
      <SubmissionEditForm
        enableReinitialize
        handleSaveDraft={() => this.handleSaveDraft()}
        handleSubmit={() => this.handleSubmit()}
        handleUnsubmit={() => this.handleUnsubmit()}
        handleSaveGrade={() => this.handleSaveGrade()}
        handleAutograde={answerId => this.handleAutograde(answerId)}
        handleReset={answerId => this.handleReset(answerId)}
        handleAutogradeSubmission={() => this.handleAutogradeSubmission()}
        handleMark={() => this.handleMark()}
        handleUnmark={() => this.handleUnmark()}
        handlePublish={() => this.handlePublish()}
        initialValues={answers}
        explanations={explanations}
        canGrade={canGrade}
        canUpdate={canUpdate}
        attempting={workflowState === workflowStates.Attempting}
        submitted={workflowState === workflowStates.Submitted}
        graded={workflowState === workflowStates.Graded}
        published={workflowState === workflowStates.Published}
        posts={posts}
        questionIds={questionIds}
        questions={questions}
        questionsFlags={questionsFlags}
        tabbedView={tabbedView}
        topics={topics}
        delayedGradePublication={delayedGradePublication}
        isSaving={isSaving}
      />
    );
  }

  render() {
    const { isLoading, isSaving, notification } = this.props;

    if (isLoading) {
      return <LoadingIndicator />;
    }
    return (
      <div>
        {this.renderProgress()}
        {this.renderContent()}
        <IntlNotificationBar notification={notification} />
      </div>
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
  answers: PropTypes.objectOf(AnswerProp),
  assessment: AssessmentProp,
  exp: PropTypes.number,
  explanations: PropTypes.objectOf(ExplanationProp),
  form: ReduxFormProp,
  grading: GradingProp.isRequired,
  notification: notificationShape,
  posts: PropTypes.objectOf(PostProp),
  questions: PropTypes.objectOf(QuestionProp),
  questionsFlags: PropTypes.objectOf(QuestionFlagsProp),
  submission: SubmissionProp,
  topics: PropTypes.objectOf(TopicProp),
  isLoading: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    answers: state.answers,
    assessment: state.assessment,
    exp: state.grading.exp,
    explanations: state.explanations,
    form: state.form[formNames.SUBMISSION],
    grading: state.grading.questions,
    notification: state.notification,
    posts: state.posts,
    submission: state.submission,
    questions: state.questions,
    questionsFlags: state.questionsFlags,
    topics: state.topics,
    isLoading: state.submissionFlags.isLoading,
    isSaving: state.submissionFlags.isSaving,
  };
}

const SubmissionEditIndex = connect(mapStateToProps)(VisibleSubmissionEditIndex);
export default SubmissionEditIndex;
