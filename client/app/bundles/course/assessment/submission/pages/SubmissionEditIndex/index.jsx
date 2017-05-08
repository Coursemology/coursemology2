import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ProgressPanel from '../../components/ProgressPanel';
import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import SubmissionEditTabForm from './SubmissionEditTabForm';
import { fetchSubmission, updateSubmission } from '../../actions';
import { AssessmentProp, ProgressProp, ReduxFormProp, SubmissionProp, TopicProp } from '../../propTypes';
import { DATA_STATES } from '../../constants';

class VisibleSubmissionEditIndex extends Component {
  componentDidMount() {
    const { fetchData, match: { params } } = this.props;
    fetchData(params.submissionId);
  }

  handleSubmit(action) {
    const { form, updateData, match: { params } } = this.props;
    const data = { submission: form.values };
    if (action) data.submission[action] = true;
    updateData(params.submissionId, data);
  }

  renderProgress() {
    const { progress, canGrade } = this.props;
    if (canGrade) {
      return <ProgressPanel progress={progress} />;
    }
    return null;
  }

  renderContent() {
    const { assessment: { autograded, tabbed_view, skippable }, submission, topics, canGrade } = this.props;
    if (autograded) {
      return (
        <SubmissionEditStepForm
          handleSubmit={this.handleSubmit}
          initialValues={submission}
          canGrade={canGrade}
          skippable={skippable}
          topics={topics}
          {...{ submission }}
        />
      );
    } else if (tabbed_view) { // eslint-disable-line camelcase
      return (
        <SubmissionEditTabForm
          handleSubmit={() => this.handleSubmit()}
          initialValues={submission}
          canGrade={canGrade}
          topics={topics}
        />
      );
    }
    return (
      <SubmissionEditForm
        handleSubmit={action => this.handleSubmit(action)}
        initialValues={submission}
        canGrade={canGrade}
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
  assessment: AssessmentProp,
  canGrade: PropTypes.bool,
  form: ReduxFormProp,
  progress: ProgressProp,
  submission: SubmissionProp,
  topics: PropTypes.arrayOf(TopicProp),
  dataState: PropTypes.string.isRequired,

  fetchData: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    assessment: state.submissionEdit.assessment,
    canGrade: state.submissionEdit.canGrade,
    form: state.form.submissionEdit,
    progress: state.submissionEdit.progress,
    submission: state.submissionEdit.submission,
    topics: state.submissionEdit.topics,
    dataState: state.submissionEdit.dataState,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchData: id => dispatch(fetchSubmission(id)),
    updateData: (id, payload) => dispatch(updateSubmission(id, payload)),
  };
}

const SubmissionEditIndex = connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleSubmissionEditIndex);
export default SubmissionEditIndex;
