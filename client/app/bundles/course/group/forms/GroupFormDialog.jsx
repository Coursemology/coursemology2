import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { isPristine, submit } from 'redux-form';
import { Dialog, FlatButton } from 'material-ui';
import { FormattedMessage } from 'react-intl';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import formTranslations from 'lib/translations/form';
import modalFormStyles from 'lib/styles/ModalForm.scss';

import { connect } from 'react-redux';
import actionTypes, { formNames } from '../constants';

const styles = {
  dialog: {
    width: '80%',
    maxWidth: 700,
  },
};

const NameDescriptionDialog = ({
  dialogTitle,
  expectedDialogTypes,
  dispatch,
  isPristine: pristine,
  isDisabled,
  isShown,
  dialogType,
  isConfirmationDialogOpen,
  children,
}) => {
  const handleClose = useCallback(
    () =>
      dispatch({
        type: actionTypes.DIALOG_CANCEL,
        payload: { isPristine: pristine },
      }),
    [dispatch, pristine],
  );

  const formActions = useMemo(
    () => [
      <FlatButton
        label={<FormattedMessage {...formTranslations.cancel} />}
        primary
        onClick={handleClose}
        disabled={isDisabled}
        key="group-popup-dialog-cancel-button"
      />,
      <FlatButton
        label={<FormattedMessage {...formTranslations.submit} />}
        className="btn-submit"
        primary
        onClick={() => dispatch(submit(formNames.GROUP))}
        disabled={isDisabled}
        key="group-popup-dialog-submit-button"
      />,
    ],
    [handleClose, isDisabled, dispatch],
  );

  const isExpectedDialogType = expectedDialogTypes.includes(dialogType);

  return (
    <>
      <Dialog
        title={dialogTitle}
        modal={false}
        open={isShown && isExpectedDialogType}
        actions={formActions}
        onRequestClose={handleClose}
        autoScrollBodyContent
        contentStyle={styles.dialog}
        bodyClassName={modalFormStyles.modalForm}
      >
        {children}
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        open={isConfirmationDialogOpen && isExpectedDialogType}
        onCancel={() => {
          dispatch({ type: actionTypes.DIALOG_CONFIRM_CANCEL });
        }}
        onConfirm={() => {
          dispatch({ type: actionTypes.DIALOG_CONFIRM_DISCARD });
        }}
      />
    </>
  );
};

NameDescriptionDialog.propTypes = {
  dialogTitle: PropTypes.string.isRequired,
  expectedDialogTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  dispatch: PropTypes.func.isRequired,
  isPristine: PropTypes.bool,
  isShown: PropTypes.bool.isRequired,
  isConfirmationDialogOpen: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  dialogType: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default connect((state) => ({
  ...state.groupsDialog,
  isPristine: isPristine(formNames.GROUP)(state),
}))(NameDescriptionDialog);
