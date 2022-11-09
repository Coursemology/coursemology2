import { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as actionCreators from 'course/lesson-plan/actions';
import FormDialogue from 'lib/components/form/FormDialogue';

import MilestoneForm from './MilestoneForm';

const MilestoneFormDialog = ({
  visible,
  disabled,
  formTitle,
  initialValues,
  onSubmit,
  dispatch,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const { hideMilestoneForm } = bindActionCreators(actionCreators, dispatch);

  return (
    <FormDialogue
      disabled={disabled}
      form="milestone-form"
      hideForm={hideMilestoneForm}
      open={visible}
      skipConfirmation={!isDirty}
      title={formTitle}
    >
      <MilestoneForm
        {...{ initialValues, onSubmit, disabled }}
        emitsVia={(milestoneForm) => setIsDirty(milestoneForm.isDirty)}
      />
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
    start_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }),
  onSubmit: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ milestoneForm }) => ({
  ...milestoneForm,
}))(MilestoneFormDialog);
