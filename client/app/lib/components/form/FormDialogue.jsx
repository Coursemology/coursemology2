import { Component } from 'react';
import { injectIntl } from 'react-intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import formTranslations from 'lib/translations/form';

const propTypes = {
  title: PropTypes.string,
  hideForm: PropTypes.func,
  submitForm: PropTypes.func,
  skipConfirmation: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  open: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  children: PropTypes.node,
  form: PropTypes.string,
};

class FormDialogue extends Component {
  constructor(props) {
    super(props);

    this.state = {
      discardConfirmationOpen: false,
    };
  }

  handleDiscard = () => {
    this.setState({ discardConfirmationOpen: false });
    this.props.hideForm();
  };

  handleDiscardCancel = () => {
    this.setState({ discardConfirmationOpen: false });
  };

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

  render() {
    const { intl, title, disabled, form, open, submitForm, children } =
      this.props;
    const formActions = [
      <Button
        key="form-dialogue-cancel-button"
        color="secondary"
        onClick={this.handleFormClose}
        {...{ disabled }}
      >
        {intl.formatMessage(formTranslations.cancel)}
      </Button>,
      <Button
        key="form-dialogue-submit-button"
        ref={(button) => {
          // eslint-disable-next-line react/no-unused-class-component-methods
          this.submitButton = button;
        }}
        className="btn-submit"
        color="primary"
        {...(form ? { form, type: 'submit' } : { onClick: submitForm })}
        {...{ disabled }}
      >
        {intl.formatMessage(formTranslations.submit)}
      </Button>,
    ];

    return (
      <>
        <Dialog
          disableEnforceFocus
          fullWidth
          maxWidth="md"
          onClose={this.handleFormClose}
          open={open}
          style={{
            top: 40,
          }}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{children}</DialogContent>
          <DialogActions>{formActions}</DialogActions>
        </Dialog>
        <ConfirmationDialog
          confirmDiscard
          onCancel={this.handleDiscardCancel}
          onConfirm={this.handleDiscard}
          open={this.state.discardConfirmationOpen}
        />
      </>
    );
  }
}

FormDialogue.propTypes = propTypes;

export default injectIntl(FormDialogue);
