import { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import FormDialogue from 'lib/components/form/FormDialogue';

import { actions } from '../../store';

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

  return (
    <FormDialogue
      disabled={disabled}
      form="milestone-form"
      hideForm={() => dispatch(actions.hideMilestoneForm())}
      open={visible}
      skipConfirmation={!isDirty}
      title={formTitle}
    >
      <MilestoneForm
        {...{ initialValues, onSubmit, disabled }}
        onDirtyChange={setIsDirty}
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

export default connect(({ lessonPlan }) => ({
  ...lessonPlan.milestoneForm,
}))(MilestoneFormDialog);
