import { useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import FormDialogue from 'lib/components/form/FormDialogue';

import actionTypes, { formNames } from '../constants';

const GroupFormDialog = ({
  dialogTitle,
  expectedDialogTypes,
  dispatch,
  isDisabled,
  isShown,
  dialogType,
  skipConfirmation,
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
      disabled={isDisabled}
      form={formNames.GROUP}
      hideForm={handleClose}
      open={isShown && isExpectedDialogType}
      skipConfirmation={skipConfirmation}
      title={dialogTitle}
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
  skipConfirmation: PropTypes.bool.isRequired,
};

export default connect(({ groups }) => ({
  isShown: groups.groupsDialog.isShown,
  dialogType: groups.groupsDialog.dialogType,
  isDisabled: groups.groupsDialog.isDisabled,
}))(GroupFormDialog);
