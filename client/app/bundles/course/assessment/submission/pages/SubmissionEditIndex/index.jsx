import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reset } from 'redux-form';

import ProgressPanel from '../../components/ProgressPanel';
import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import {
  fetchSubmission, autogradeSubmission, saveDraft, submit,
  unsubmit, autogradeAnswer, resetAnswer, saveGrade, mark, unmark, publish,
} from '../../actions';
import {
  AnswerProp, AssessmentProp, ExplanationProp, GradingProp,
  PostProp, QuestionProp, ReduxFormProp, SubmissionProp, TopicProp,
} from '../../propTypes';
import { DATA_STATES, workflowStates } from '../../constants';

class VisibleSubmissionEditIndex extends Component {
  componentDidMount() {
    const { boundFetchSubmission, match: { params } } = this.props;
    boundFetchSubmission(params.submissionId);
  }

  allCorrect() {
    const { explanations, questions } = this.props;
    if (Object.keys(explanations).length !== Object.keys(questions).length) {
      return false;
    }

    const numIncorrect = Object.keys(explanations).filter(
      qid => explanations[qid] && !explanations[qid].correct
    ).length;
    return numIncorrect === 0;
  }

  handleAutogradeSubmission() {
    const { match: { params }, boundAutogradeSubmission } = this.props;
    boundAutogradeSubmission(params.submissionId);
  }

  handleSubmit() {
    const { form, match: { params }, boundFinalise, resetForm } = this.props;
    const answers = Object.values(form.values);
    boundFinalise(params.submissionId, answers);
    resetForm();
  }

  handleUnsubmit() {
    const { match: { params }, boundUnsubmit } = this.props;
    boundUnsubmit(params.submissionId);
  }

  handleSaveDraft() {
    const { form, match: { params }, boundSaveDraft, resetForm } = this.props;
    const answers = Object.values(form.values);
    boundSaveDraft(params.submissionId, answers);
    resetForm();
  }

  handleSaveGrade() {
    const { match: { params }, grading, boundSaveGrade } = this.props;
    boundSaveGrade(params.submissionId, Object.values(grading));
  }

  handleReset(answerId) {
    const { match: { params }, boundResetAnswer } = this.props;
    boundResetAnswer(params.submissionId, answerId);
  }

  handleAutograde(answerId) {
    const { form, match: { params }, boundAutograde } = this.props;
    const answers = [form.values[answerId]];
    boundAutograde(params.submissionId, answers);
  }

  handleMark() {
    const { match: { params }, grading, boundMark } = this.props;
    boundMark(params.submissionId, Object.values(grading));
  }

  handleUnmark() {
    const { match: { params }, boundUnmark } = this.props;
    boundUnmark(params.submissionId);
  }

  handlePublish() {
    const { match: { params }, grading, boundPublish } = this.props;
    boundPublish(params.submissionId, Object.values(grading));
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
      topics,
      saveState,
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
          topics={topics}
          saveState={saveState}
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
        tabbedView={tabbedView}
        topics={topics}
        delayedGradePublication={delayedGradePublication}
      />
    );
  }

  render() {
    const { dataState } = this.props;
    if (dataState === DATA_STATES.Received) {
      return (
        <div>
          {this.renderProgress()}
          {this.renderContent()}
        </div>
      );
    } else if (dataState === DATA_STATES.Error) {
      return <p>Error...</p>;
    }
    return <p>Loading...</p>;
  }
}

VisibleSubmissionEditIndex.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string,
      assessmentId: PropTypes.string,
      submissionId: PropTypes.string,
    }),
  }),
  answers: PropTypes.objectOf(AnswerProp),
  assessment: AssessmentProp,
  explanations: PropTypes.objectOf(ExplanationProp),
  form: ReduxFormProp,
  grading: GradingProp.isRequired,
  posts: PropTypes.objectOf(PostProp),
  questions: PropTypes.objectOf(QuestionProp),
  submission: SubmissionProp,
  topics: PropTypes.objectOf(TopicProp),
  dataState: PropTypes.string.isRequired,
  saveState: PropTypes.string.isRequired,

  boundFetchSubmission: PropTypes.func.isRequired,
  boundAutogradeSubmission: PropTypes.func.isRequired,
  boundResetAnswer: PropTypes.func.isRequired,
  boundAutograde: PropTypes.func.isRequired,
  boundSaveDraft: PropTypes.func.isRequired,
  boundSaveGrade: PropTypes.func.isRequired,
  boundFinalise: PropTypes.func.isRequired,
  boundUnsubmit: PropTypes.func.isRequired,
  boundMark: PropTypes.func.isRequired,
  boundUnmark: PropTypes.func.isRequired,
  boundPublish: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    answers: state.answers,
    assessment: state.submissionEdit.assessment,
    explanations: state.explanations,
    form: state.form.submissionEdit,
    grading: state.grading.questions,
    maxStep: state.submissionEdit.maxStep,
    posts: state.posts,
    submission: state.submissionEdit.submission,
    questions: state.questions,
    topics: state.topics,
    dataState: state.submissionEdit.dataState,
    saveState: state.submissionEdit.saveState,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    boundFetchSubmission: id => dispatch(fetchSubmission(id)),
    boundAutogradeSubmission: id => dispatch(autogradeSubmission(id)),
    boundResetAnswer: (id, answerId) => dispatch(resetAnswer(id, answerId)),
    boundAutograde: (id, answers) => dispatch(autogradeAnswer(id, answers)),
    boundSaveDraft: (id, answers) => dispatch(saveDraft(id, answers)),
    boundSaveGrade: (id, grades) => dispatch(saveGrade(id, grades)),
    boundFinalise: (id, answers) => dispatch(submit(id, answers)),
    boundUnsubmit: id => dispatch(unsubmit(id)),
    boundMark: (id, grades) => dispatch(mark(id, grades)),
    boundUnmark: id => dispatch(unmark(id)),
    boundPublish: (id, grades) => dispatch(publish(id, grades)),
    resetForm: () => dispatch(reset('submissionEdit')),
  };
}

const SubmissionEditIndex = connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleSubmissionEditIndex);
export default SubmissionEditIndex;
