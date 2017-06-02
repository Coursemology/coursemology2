import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ProgressPanel from '../../components/ProgressPanel';
import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import SubmissionEditTabForm from './SubmissionEditTabForm';
import {
  fetchSubmission, saveDraft, submit,
  unsubmit, autograde, mark, publish,
} from '../../actions';
import {
  AnswerProp, AssessmentProp, ExplanationProp, GradingProp, PostProp, QuestionProp,
  ReduxFormProp, SubmissionProp, TopicProp,
} from '../../propTypes';
import { DATA_STATES } from '../../constants';

class VisibleSubmissionEditIndex extends Component {
  componentDidMount() {
    const { fetchData, match: { params } } = this.props;
    fetchData(params.submissionId);
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

  handleMark() {
    const { match: { params }, grading, markAnswer } = this.props;
    markAnswer(params.submissionId, Object.values(grading));
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
      assessment: { autograded, tabbedView, skippable, questionIds },
      submission: { canGrade, maxStep, submittedAt },
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
          handleSubmit={() => this.handleSubmit()}
          handleUnsubmit={() => this.handleUnsubmit()}
          handleSaveDraft={() => this.handleSaveDraft()}
          handleAutograde={answerId => this.handleAutograde(answerId)}
          initialValues={answers}
          explanations={explanations}
          canGrade={canGrade}
          submitted={!!submittedAt}
          maxStep={maxStep}
          skippable={skippable}
          posts={posts}
          questionIds={questionIds}
          questions={questions}
          topics={topics}
          saveState={saveState}
        />
      );
    } else if (tabbedView) {
      return (
        <SubmissionEditTabForm
          enableReinitialize
          handleSaveDraft={() => this.handleSaveDraft()}
          handleSubmit={() => this.handleSubmit()}
          handleUnsubmit={() => this.handleUnsubmit()}
          handleMark={() => this.handleMark()}
          handlePublish={() => this.handlePublish()}
          initialValues={answers}
          canGrade={canGrade}
          submitted={!!submittedAt}
          posts={posts}
          questionIds={questionIds}
          questions={questions}
          topics={topics}
        />
      );
    }
    return (
      <SubmissionEditForm
        enableReinitialize
        handleSaveDraft={() => this.handleSaveDraft()}
        handleSubmit={() => this.handleSubmit()}
        handleUnsubmit={() => this.handleUnsubmit()}
        handleMark={() => this.handleMark()}
        handlePublish={() => this.handlePublish()}
        initialValues={answers}
        canGrade={canGrade}
        submitted={!!submittedAt}
        posts={posts}
        questionIds={questionIds}
        questions={questions}
        topics={topics}
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
  grading: PropTypes.objectOf(GradingProp),
  posts: PropTypes.objectOf(PostProp),
  questions: PropTypes.objectOf(QuestionProp),
  submission: SubmissionProp,
  topics: PropTypes.objectOf(TopicProp),
  dataState: PropTypes.string.isRequired,
  saveState: PropTypes.string.isRequired,

  fetchData: PropTypes.func.isRequired,
  submitAnswer: PropTypes.func.isRequired,
  unsubmitAnswer: PropTypes.func.isRequired,
  saveDraftAnswer: PropTypes.func.isRequired,
  autogradeAnswer: PropTypes.func.isRequired,
  markAnswer: PropTypes.func.isRequired,
  publishAnswer: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    answers: state.answers,
    assessment: state.submissionEdit.assessment,
    explanations: state.explanations,
    form: state.form.submissionEdit,
    grading: state.grading,
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
    submitAnswer: (id, answers) => dispatch(submit(id, answers)),
    unsubmitAnswer: id => dispatch(unsubmit(id)),
    saveDraftAnswer: (id, answers) => dispatch(saveDraft(id, answers)),
    autogradeAnswer: (id, answers) => dispatch(autograde(id, answers)),
    markAnswer: (id, grades) => dispatch(mark(id, grades)),
    publishAnswer: (id, grades) => dispatch(publish(id, grades)),
  };
}

const SubmissionEditIndex = connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleSubmissionEditIndex);
export default SubmissionEditIndex;
