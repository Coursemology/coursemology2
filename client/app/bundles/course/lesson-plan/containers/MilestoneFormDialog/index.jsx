import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FormDialogue from 'lib/components/FormDialogue';
import * as actionCreators from 'course/lesson-plan/actions';
import MilestoneForm from './MilestoneForm';

const MilestoneFormDialog = ({
  visible,
  disabled,
  formTitle,
  initialValues,
  onSubmit,
  dispatch,
}) => {
  const { hideMilestoneForm } = bindActionCreators(actionCreators, dispatch);

  return (
    <FormDialogue
      title={formTitle}
      open={visible}
      skipConfirmation={false}
      disabled={disabled}
      form="milestone-form"
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
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ milestoneForm }) => ({
  ...milestoneForm,
}))(MilestoneFormDialog);
