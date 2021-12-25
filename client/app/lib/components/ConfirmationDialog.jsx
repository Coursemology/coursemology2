import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
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
      <FlatButton
        key="confirmation-dialog-cancel-button"
        ref={(button) => {
          // eslint-disable-next-line react/no-unused-class-component-methods
          this.cancelButton = button;
        }}
        className="cancel-btn"
        disabled={disableCancelButton}
        keyboardFocused={true}
        label={cancelButtonText || intl.formatMessage(formTranslations.cancel)}
        onClick={onCancel}
        primary={true}
        style={buttonStyle}
      />,
      <FlatButton
        key="confirmation-dialog-confirm-button"
        ref={(button) => {
          // eslint-disable-next-line react/no-unused-class-component-methods
          this.confirmButton = button;
        }}
        className="confirm-btn"
        disabled={disableConfirmButton}
        label={confirmationButtonText}
        onClick={onConfirm}
        primary={true}
        style={buttonStyle}
      />,
    ];

    if (onConfirmSecondary) {
      const confirmButtonSecondary = [
        <FlatButton
          key="confirmation-dialog-confirm-secondary-button"
          ref={(button) => {
            // eslint-disable-next-line react/no-unused-class-component-methods
            this.confirmButtonSecondary = button;
          }}
          className="confirm-btn"
          disabled={disableConfirmButton}
          label={confirmationSecondaryButtonText}
          onClick={onConfirmSecondary}
          primary={true}
          style={buttonStyle}
        />,
      ];
      actions.push(...confirmButtonSecondary);
    }

    return (
      <div>
        <Dialog
          {...{ open, actions }}
          autoScrollBodyContent={true}
          modal={false}
          onRequestClose={onCancel}
          style={{ zIndex: 9999 }}
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
