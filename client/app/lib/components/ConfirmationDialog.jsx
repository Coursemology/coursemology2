import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import { Button } from '@material-ui/core';
import formTranslations from 'lib/translations/form';

const buttonStyle = {
  margin: 3,
};

class ConfirmationDialog extends React.Component {
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
        color="primary"
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
      <div>
        <Dialog
          {...{ open, actions }}
          modal={false}
          onRequestClose={onCancel}
          style={{ zIndex: 9999 }}
          autoScrollBodyContent
        >
          {confirmationMessage}
        </Dialog>
      </div>
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

  intl: intlShape.isRequired,
};

export default injectIntl(ConfirmationDialog);
