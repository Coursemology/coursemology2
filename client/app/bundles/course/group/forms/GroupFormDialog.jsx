import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { isPristine, submit } from 'redux-form';
import { connect } from 'react-redux';

import FormDialogue from 'lib/components/FormDialogue';
import actionTypes, { formNames } from '../constants';

const GroupFormDialog = ({
  dialogTitle,
  expectedDialogTypes,
  dispatch,
  isPristine: pristine,
  isDisabled,
  isShown,
  dialogType,
  children,
  form,
}) => {
  const handleClose = useCallback(
    () =>
      dispatch({
        type: actionTypes.DIALOG_CANCEL,
        payload: { isPristine: pristine },
      }),
    [dispatch, pristine],
  );

  const handleSubmit = useCallback(
    () => dispatch(submit(formNames.GROUP)),
    [dispatch],
  );

  const isExpectedDialogType = expectedDialogTypes.includes(dialogType);

  return (
    <FormDialogue
      title={dialogTitle}
      open={isShown && isExpectedDialogType}
      disabled={isDisabled}
      hideForm={handleClose}
      skipConfirmation={false}
      {...(form ? { form } : { submitForm: handleSubmit })}
    >
      {children}
    </FormDialogue>
  );
};

GroupFormDialog.propTypes = {
  dialogTitle: PropTypes.string.isRequired,
  expectedDialogTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  dispatch: PropTypes.func.isRequired,
  isPristine: PropTypes.bool,
  isShown: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  dialogType: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  form: PropTypes.string.isRequired,
};

export default connect((state) => ({
  ...state.groupsDialog,
  isPristine: isPristine(formNames.GROUP)(state),
}))(GroupFormDialog);
