import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ProgressPanel from '../../components/ProgressPanel';
import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import { fetchSubmission, updateSubmission } from '../../actions';
import { AssessmentProp, ProgressProp, ReduxFormProp, SubmissionProp } from '../../propTypes';
import { DATA_STATES } from '../../constants';

class VisibleSubmissionEditIndex extends Component {
  componentDidMount() {
    const { fetchData, params } = this.props;
    fetchData(params.submissionId);
  }

  handleSubmit() {
    const { form, updateData, params } = this.props;
    const data = { submission: form.values };
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
    const { assessment: { autograded, skippable }, submission, canGrade } = this.props;
    if (autograded) {
      return (
        <SubmissionEditStepForm
          handleSubmit={() => this.handleSubmit()}
          initialValues={submission}
          canGrade={canGrade}
          skippable={skippable}
          {...{ submission }}
        />
      );
    }
    return (
      <SubmissionEditForm
        handleSubmit={() => this.handleSubmit()}
        initialValues={submission}
        canGrade={canGrade}
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
  params: PropTypes.shape({
    courseId: PropTypes.string,
    assessmentId: PropTypes.string,
    submissionId: PropTypes.string,
  }),
  assessment: AssessmentProp,
  canGrade: PropTypes.bool,
  form: ReduxFormProp,
  progress: ProgressProp,
  submission: SubmissionProp,
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
