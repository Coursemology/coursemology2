import { Component } from 'react';
import { injectIntl } from 'react-intl';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

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

    const confirmationSecondaryButtonText =
      confirmSecondaryButtonText ??
      intl.formatMessage(formTranslations.continue);

    let confirmationMessage = intl.formatMessage(formTranslations.areYouSure);
    if (message) {
      confirmationMessage = message;
    } else if (confirmDiscard) {
      confirmationMessage = intl.formatMessage(formTranslations.discardChanges);
    }

    const actions = [
      <Button
        key="confirmation-dialog-cancel-button"
        ref={(button) => {
          // eslint-disable-next-line react/no-unused-class-component-methods
          this.cancelButton = button;
        }}
        className="cancel-btn"
        color="secondary"
        disabled={disableCancelButton}
        onClick={onCancel}
        style={buttonStyle}
      >
        {cancelButtonText || intl.formatMessage(formTranslations.cancel)}
      </Button>,
      <LoadingButton
        key="confirmation-dialog-confirm-button"
        className="confirm-btn"
        color="primary"
        disabled={disableConfirmButton}
        loading={loadingConfirmButton}
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
      actions.push(
        <Button
          key="confirmation-dialog-confirm-secondary-button"
          ref={(button) => {
            // eslint-disable-next-line react/no-unused-class-component-methods
            this.confirmButtonSecondary = button;
          }}
          className="confirm-btn"
          color="primary"
          disabled={disableConfirmButton}
          onClick={onConfirmSecondary}
          style={buttonStyle}
        >
          {confirmationSecondaryButtonText}
        </Button>,
      );
    }

    const handleDialogClose = (_event, reason) => {
      if (reason !== 'backdropClick') {
        onCancel();
      }
    };

    return (
      <Dialog
        data-testid="ConfirmationDialog"
        disableEscapeKeyDown={disableCancelButton || disableConfirmButton}
        fullWidth
        maxWidth="md"
        onClose={
          disableCancelButton || disableConfirmButton
            ? handleDialogClose
            : onCancel
        }
        open={open}
        style={{ zIndex: 9999 }}
      >
        <DialogContent>
          <Typography variant="body2">{confirmationMessage}</Typography>
        </DialogContent>
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
