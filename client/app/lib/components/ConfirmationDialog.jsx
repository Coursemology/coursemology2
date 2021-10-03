import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
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
      message,
      cancelButtonText,
      confirmButtonText,
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

    let confirmationMessage = intl.formatMessage(formTranslations.areYouSure);
    if (message) {
      confirmationMessage = message;
    } else if (confirmDiscard) {
      confirmationMessage = intl.formatMessage(formTranslations.discardChanges);
    }

    const actions = [
      <FlatButton
        primary
        keyboardFocused
        className="cancel-btn"
        disabled={disableCancelButton}
        onClick={onCancel}
        style={buttonStyle}
        label={cancelButtonText || intl.formatMessage(formTranslations.cancel)}
        ref={(button) => {
          this.cancelButton = button;
        }}
        key="confirmation-dialog-cancel-button"
      />,
      <FlatButton
        primary
        className="confirm-btn"
        disabled={disableConfirmButton}
        onClick={onConfirm}
        style={buttonStyle}
        label={confirmationButtonText}
        ref={(button) => {
          this.confirmButton = button;
        }}
        key="confirmation-dialog-confirm-button"
      />,
    ];

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
  message: PropTypes.node,
  cancelButtonText: PropTypes.node,
  confirmButtonText: PropTypes.node,
  confirmDiscard: PropTypes.bool,
  confirmDelete: PropTypes.bool,
  confirmSubmit: PropTypes.bool,
  disableCancelButton: PropTypes.bool,
  disableConfirmButton: PropTypes.bool,

  intl: intlShape.isRequired,
};

export default injectIntl(ConfirmationDialog);
