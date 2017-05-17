import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ProgressPanel from '../../components/ProgressPanel';
import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import SubmissionEditTabForm from './SubmissionEditTabForm';
import { fetchSubmission, saveDraft, submit, unsubmit, autograde } from '../../actions';
import {
  AnswerProp, AssessmentProp, ProgressProp, QuestionProp,
  ReduxFormProp, TopicProp, ExplanationProp,
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

  renderProgress() {
    const { progress, canGrade } = this.props;
    if (canGrade) {
      return <ProgressPanel progress={progress} />;
    }
    return null;
  }

  renderContent() {
    const {
      assessment: { autograded, tabbedView, skippable },
      canGrade,
      maxStep,
      answers,
      questions,
      topics,
      explanations,
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
          canGrade={canGrade}
          maxStep={maxStep}
          skippable={skippable}
          questions={questions}
          topics={topics}
          explanations={explanations}
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
          initialValues={answers}
          canGrade={canGrade}
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
        initialValues={answers}
        canGrade={canGrade}
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
  canGrade: PropTypes.bool,
  canUpdate: PropTypes.bool,
  form: ReduxFormProp,
  maxStep: PropTypes.number,
  progress: ProgressProp,
  questions: PropTypes.shape({
    byId: PropTypes.objectOf(QuestionProp),
    allIds: PropTypes.arrayOf(PropTypes.number),
  }),
  topics: PropTypes.objectOf(TopicProp),
  explanations: PropTypes.objectOf(ExplanationProp),
  dataState: PropTypes.string.isRequired,
  saveState: PropTypes.string.isRequired,

  fetchData: PropTypes.func.isRequired,
  submitAnswer: PropTypes.func.isRequired,
  unsubmitAnswer: PropTypes.func.isRequired,
  saveDraftAnswer: PropTypes.func.isRequired,
  autogradeAnswer: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    answers: state.answers,
    assessment: state.submissionEdit.assessment,
    canGrade: state.submissionEdit.canGrade,
    form: state.form.submissionEdit,
    maxStep: state.submissionEdit.maxStep,
    progress: state.submissionEdit.progress,
    questions: state.questions,
    topics: state.topics,
    explanations: state.explanations,
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
  };
}

const SubmissionEditIndex = connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleSubmissionEditIndex);
export default SubmissionEditIndex;
