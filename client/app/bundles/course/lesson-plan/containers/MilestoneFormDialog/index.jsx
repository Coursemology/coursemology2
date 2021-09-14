import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isPristine } from 'redux-form';
import FormDialogue from 'lib/components/FormDialogue';
import { formNames } from 'course/lesson-plan/constants';
import * as actionCreators from 'course/lesson-plan/actions';
import MilestoneForm from './MilestoneForm';

const MilestoneFormDialog = ({
  visible,
  disabled,
  formTitle,
  initialValues,
  onSubmit,
  pristine,
  dispatch,
}) => {
  const { hideMilestoneForm, submitMilestoneForm } = bindActionCreators(
    actionCreators,
    dispatch
  );

  return (
    <FormDialogue
      title={formTitle}
      open={visible}
      submitForm={submitMilestoneForm}
      skipConfirmation={pristine}
      disabled={disabled}
      hideForm={hideMilestoneForm}
    >
      <MilestoneForm {...{ initialValues, onSubmit, disabled }} />
    </FormDialogue>
  );
};

MilestoneFormDialog.defaultProps = {
  visible: false,
  disabled: false,
};

MilestoneFormDialog.propTypes = {
  visible: PropTypes.bool,
  disabled: PropTypes.bool,
  formTitle: PropTypes.string,
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    start_at: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ milestoneForm, ...state }) => ({
  ...milestoneForm,
  pristine: isPristine(formNames.MILESTONE)(state),
}))(MilestoneFormDialog);
