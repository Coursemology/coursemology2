import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FormDialogue from 'lib/components/FormDialogue';
import actionTypes, { formNames } from '../constants';

const GroupFormDialog = ({
  dialogTitle,
  expectedDialogTypes,
  dispatch,
  isDisabled,
  isShown,
  dialogType,
  children,
}) => {
  const handleClose = useCallback(
    () =>
      dispatch({
        type: actionTypes.DIALOG_CANCEL,
      }),
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
      form={formNames.GROUP}
    >
      {children}
    </FormDialogue>
  );
};

GroupFormDialog.propTypes = {
  dialogTitle: PropTypes.string.isRequired,
  expectedDialogTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  dispatch: PropTypes.func.isRequired,
  isShown: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  dialogType: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default connect((state) => ({
  ...state.groupsDialog,
}))(GroupFormDialog);
