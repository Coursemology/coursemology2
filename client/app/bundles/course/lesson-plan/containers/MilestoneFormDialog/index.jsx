import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { isPristine } from 'redux-form';

import * as actionCreators from 'course/lesson-plan/actions';
import { formNames } from 'course/lesson-plan/constants';
import FormDialogue from 'lib/components/FormDialogue';

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
    dispatch,
  );

  return (
    <FormDialogue
      disabled={disabled}
      hideForm={hideMilestoneForm}
      open={visible}
      skipConfirmation={pristine}
      submitForm={submitMilestoneForm}
      title={formTitle}
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
