import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
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
          this.cancelButton = button;
        }}
        style={buttonStyle}
      >
        {cancelButtonText || intl.formatMessage(formTranslations.cancel)}
      </Button>,
      <Button
        color="primary"
        className="confirm-btn"
        disabled={disableConfirmButton}
        key="confirmation-dialog-confirm-button"
        onClick={onConfirm}
        {...(form ? { form, type: 'submit' } : {})}
        ref={(button) => {
          this.confirmButton = button;
        }}
        style={buttonStyle}
      >
        {confirmationButtonText}
      </Button>,
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
            this.confirmButtonSecondary = button;
          }}
          style={buttonStyle}
        >
          {confirmationSecondaryButtonText}
        </Button>,
      ];
      actions.push(...confirmButtonSecondary);
    }

    return (
      <Dialog
        fullWidth
        onClose={onCancel}
        open={open}
        maxWidth="md"
        style={{ zIndex: 9999 }}
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
  form: PropTypes.string,
  intl: intlShape.isRequired,
};

export default injectIntl(ConfirmationDialog);
