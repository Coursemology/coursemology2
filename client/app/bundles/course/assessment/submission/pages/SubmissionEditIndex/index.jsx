import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ProgressPanel from '../../components/ProgressPanel';
import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import {
  fetchSubmission, autogradeSubmission, saveDraft, submit,
  unsubmit, autograde, reset, saveGrade, mark, unmark, publish,
} from '../../actions';
import {
  AnswerProp, AssessmentProp, ExplanationProp, GradingProp, PostProp, QuestionProp,
  ReduxFormProp, SubmissionProp, TopicProp,
} from '../../propTypes';
import { DATA_STATES, workflowStates } from '../../constants';

class VisibleSubmissionEditIndex extends Component {
  componentDidMount() {
    const { fetchData, match: { params } } = this.props;
    fetchData(params.submissionId);
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
    const { match: { params }, autogradeAll } = this.props;
    autogradeAll(params.submissionId);
  }

  handleSubmit() {
    const { form, match: { params }, submitAnswer } = this.props;
    const answers = Object.values(form.values);
    submitAnswer(params.submissionId, answers);
  }

  handleUnsubmit() {
    const { match: { params }, unsubmitAnswer } = this.props;
    unsubmitAnswer(params.submissionId);
  }

  handleSaveDraft() {
    const { form, match: { params }, saveDraftAnswer } = this.props;
    const answers = Object.values(form.values);
    saveDraftAnswer(params.submissionId, answers);
  }

  handleAutograde(answerId) {
    const { form, match: { params }, autogradeAnswer } = this.props;
    const answers = [form.values[answerId]];
    autogradeAnswer(params.submissionId, answers);
  }

  handleSaveGrade() {
    const { match: { params }, grading, saveAnswerGrade } = this.props;
    saveAnswerGrade(params.submissionId, Object.values(grading));
  }

  handleReset(answerId) {
    const { match: { params }, resetAnswer } = this.props;
    resetAnswer(params.submissionId, answerId);
  }

  handleMark() {
    const { match: { params }, grading, markAnswer } = this.props;
    markAnswer(params.submissionId, Object.values(grading));
  }

  handleUnmark() {
    const { match: { params }, unmarkAnswer } = this.props;
    unmarkAnswer(params.submissionId);
  }

  handlePublish() {
    const { match: { params }, grading, publishAnswer } = this.props;
    publishAnswer(params.submissionId, Object.values(grading));
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

  fetchData: PropTypes.func.isRequired,
  autogradeAll: PropTypes.func.isRequired,
  submitAnswer: PropTypes.func.isRequired,
  unsubmitAnswer: PropTypes.func.isRequired,
  saveDraftAnswer: PropTypes.func.isRequired,
  autogradeAnswer: PropTypes.func.isRequired,
  saveAnswerGrade: PropTypes.func.isRequired,
  resetAnswer: PropTypes.func.isRequired,
  markAnswer: PropTypes.func.isRequired,
  unmarkAnswer: PropTypes.func.isRequired,
  publishAnswer: PropTypes.func.isRequired,
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
    fetchData: id => dispatch(fetchSubmission(id)),
    autogradeAll: id => dispatch(autogradeSubmission(id)),
    submitAnswer: (id, answers) => dispatch(submit(id, answers)),
    unsubmitAnswer: id => dispatch(unsubmit(id)),
    saveDraftAnswer: (id, answers) => dispatch(saveDraft(id, answers)),
    autogradeAnswer: (id, answers) => dispatch(autograde(id, answers)),
    saveAnswerGrade: (id, grades) => dispatch(saveGrade(id, grades)),
    resetAnswer: (id, answerId) => dispatch(reset(id, answerId)),
    markAnswer: (id, grades) => dispatch(mark(id, grades)),
    unmarkAnswer: id => dispatch(unmark(id)),
    publishAnswer: (id, grades) => dispatch(publish(id, grades)),
  };
}

const SubmissionEditIndex = connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleSubmissionEditIndex);
export default SubmissionEditIndex;
