import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import formTranslations from 'lib/translations/form';

const buttonStyle = {
  margin: 3,
};

class ConfirmationDialog extends Component {
  render() {
    const {
      intl,
      open,
      onCancel,
      onConfirm,
      onConfirmSecondary,
      message,
      cancelButtonText,
      confirmButtonText,
      confirmSecondaryButtonText,
      confirmDiscard,
      confirmDelete,
      confirmSubmit,
      disableCancelButton,
      disableConfirmButton,
      loadingConfirmButton,
      form,
    } = this.props;

    let confirmationButtonText = intl.formatMessage(formTranslations.continue);
    if (confirmButtonText) {
      confirmationButtonText = confirmButtonText;
    } else if (confirmDelete) {
      confirmationButtonText = intl.formatMessage(formTranslations.delete);
    } else if (confirmDiscard) {
      confirmationButtonText = intl.formatMessage(formTranslations.discard);
    } else if (confirmSubmit) {
      confirmationButtonText = intl.formatMessage(formTranslations.submit);
    }

    let confirmationSecondaryButtonText = intl.formatMessage(
      formTranslations.continue,
    );
    if (confirmSecondaryButtonText) {
      confirmationSecondaryButtonText = confirmSecondaryButtonText;
    }

    let confirmationMessage = intl.formatMessage(formTranslations.areYouSure);
    if (message) {
      confirmationMessage = message;
    } else if (confirmDiscard) {
      confirmationMessage = intl.formatMessage(formTranslations.discardChanges);
    }

    const actions = [
      <Button
        color="secondary"
        className="cancel-btn"
        disabled={disableCancelButton}
        key="confirmation-dialog-cancel-button"
        onClick={onCancel}
        ref={(button) => {
          // eslint-disable-next-line react/no-unused-class-component-methods
          this.cancelButton = button;
        }}
        style={buttonStyle}
      >
        {cancelButtonText || intl.formatMessage(formTranslations.cancel)}
      </Button>,
      <LoadingButton
        color="primary"
        className="confirm-btn"
        disabled={disableConfirmButton}
        loading={loadingConfirmButton}
        key="confirmation-dialog-confirm-button"
        onClick={onConfirm}
        {...(form ? { form, type: 'submit' } : {})}
        ref={(button) => {
          // eslint-disable-next-line react/no-unused-class-component-methods
          this.confirmButton = button;
        }}
        style={buttonStyle}
      >
        {confirmationButtonText}
      </LoadingButton>,
    ];

    if (onConfirmSecondary) {
      const confirmButtonSecondary = [
        <Button
          color="primary"
          className="confirm-btn"
          disabled={disableConfirmButton}
          key="confirmation-dialog-confirm-secondary-button"
          onClick={onConfirmSecondary}
          ref={(button) => {
            // eslint-disable-next-line react/no-unused-class-component-methods
            this.confirmButtonSecondary = button;
          }}
          style={buttonStyle}
        >
          {confirmationSecondaryButtonText}
        </Button>,
      ];
      actions.push(...confirmButtonSecondary);
    }

    const handleDialogClose = (_event, reason) => {
      if (reason && reason !== 'backdropClick') {
        onCancel();
      }
    };

    return (
      <Dialog
        fullWidth
        disableEscapeKeyDown={disableCancelButton || disableConfirmButton}
        onClose={
          disableCancelButton || disableConfirmButton
            ? handleDialogClose
            : onCancel
        }
        open={open}
        maxWidth="md"
        style={{ zIndex: 9999 }}
        data-testid="ConfirmationDialog"
      >
        <DialogContent>{confirmationMessage}</DialogContent>
        <DialogActions>{actions}</DialogActions>
      </Dialog>
    );
  }
}

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onConfirmSecondary: PropTypes.func,
  message: PropTypes.node,
  cancelButtonText: PropTypes.node,
  confirmButtonText: PropTypes.node,
  confirmSecondaryButtonText: PropTypes.node,
  confirmDiscard: PropTypes.bool,
  confirmDelete: PropTypes.bool,
  confirmSubmit: PropTypes.bool,
  disableCancelButton: PropTypes.bool,
  disableConfirmButton: PropTypes.bool,
  loadingConfirmButton: PropTypes.bool,
  form: PropTypes.string,
  intl: PropTypes.object.isRequired,
};

/**
 * @deprecated Use `Prompt` instead.
 */
export default injectIntl(ConfirmationDialog);
