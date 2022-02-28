import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import formTranslations from 'lib/translations/form';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

const propTypes = {
  title: PropTypes.string,
  hideForm: PropTypes.func,
  submitForm: PropTypes.func,
  skipConfirmation: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  open: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  children: PropTypes.node,
};

class FormDialogue extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      discardConfirmationOpen: false,
    };
  }

  handleFormClose = () => {
    const { hideForm, disabled, skipConfirmation } = this.props;
    if (disabled) {
      return;
    }

    if (skipConfirmation) {
      hideForm();
    } else {
      this.setState({ discardConfirmationOpen: true });
    }
  };

  handleDiscardCancel = () => {
    this.setState({ discardConfirmationOpen: false });
  };

  handleDiscard = () => {
    this.setState({ discardConfirmationOpen: false });
    this.props.hideForm();
  };

  render() {
    const { intl, title, disabled, open, submitForm, children } = this.props;
    const formActions = [
      <Button
        color="primary"
        key="form-dialogue-cancel-button"
        onClick={this.handleFormClose}
        {...{ disabled }}
      >
        {intl.formatMessage(formTranslations.cancel)}
      </Button>,
      <Button
        ref={(button) => {
          this.submitButton = button;
        }}
        color="primary"
        className="btn-submit"
        key="form-dialogue-submit-button"
        onClick={submitForm}
        {...{ disabled }}
      >
        {intl.formatMessage(formTranslations.submit)}
      </Button>,
    ];

    return (
      <>
        <Dialog
          fullWidth
          maxWidth="md"
          open={open}
          onClose={this.handleFormClose}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{children}</DialogContent>
          <DialogActions>{formActions}</DialogActions>
        </Dialog>
        <ConfirmationDialog
          confirmDiscard
          open={this.state.discardConfirmationOpen}
          onCancel={this.handleDiscardCancel}
          onConfirm={this.handleDiscard}
        />
      </>
    );
  }
}

FormDialogue.propTypes = propTypes;

export default injectIntl(FormDialogue);
