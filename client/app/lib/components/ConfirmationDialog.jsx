import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import formTranslations from 'lib/translations/form';

const buttonStyle = {
  margin: 3,
};

const ConfirmationDialog = ({
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
}) => {
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
      disabled={disableCancelButton}
      onTouchTap={onCancel}
      style={buttonStyle}
      label={cancelButtonText || intl.formatMessage(formTranslations.cancel)}
    />,
    <FlatButton
      primary
      disabled={disableConfirmButton}
      onTouchTap={onConfirm}
      style={buttonStyle}
      label={confirmationButtonText}
    />,
  ];

  return (
    <div>
      <Dialog
        {...{ open, actions }}
        modal={false}
        onRequestClose={onCancel}
      >
        { confirmationMessage }
      </Dialog>
    </div>
  );
};

ConfirmationDialog.propTypes = {
  intl: intlShape.isRequired,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.string,
  cancelButtonText: PropTypes.string,
  confirmButtonText: PropTypes.string,
  confirmDiscard: PropTypes.bool,
  confirmDelete: PropTypes.bool,
  confirmSubmit: PropTypes.bool,
  disableCancelButton: PropTypes.bool,
  disableConfirmButton: PropTypes.bool,
};

export default injectIntl(ConfirmationDialog);
