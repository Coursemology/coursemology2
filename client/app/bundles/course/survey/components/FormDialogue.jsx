import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
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
  }

  handleDiscardCancel = () => {
    this.setState({ discardConfirmationOpen: false });
  }

  handleDiscard = () => {
    this.setState({ discardConfirmationOpen: false });
    this.props.hideForm();
  }

  render() {
    const { intl, title, disabled, open, submitForm, children } = this.props;
    const formActions = [
      <FlatButton
        label={intl.formatMessage(formTranslations.cancel)}
        primary
        onTouchTap={this.handleFormClose}
        {...{ disabled }}
      />,
      <FlatButton
        ref={(button) => { this.submitButton = button; }}
        label={intl.formatMessage(formTranslations.submit)}
        primary
        keyboardFocused
        onTouchTap={submitForm}
        {...{ disabled }}
      />,
    ];

    return (
      <div>
        <Dialog
          {...{ title, open }}
          actions={formActions}
          modal={false}
          onRequestClose={this.handleFormClose}
          autoScrollBodyContent
        >
          { children }
        </Dialog>
        <ConfirmationDialog
          confirmDiscard
          open={this.state.discardConfirmationOpen}
          onCancel={this.handleDiscardCancel}
          onConfirm={this.handleDiscard}
        />
      </div>
    );
  }
}

FormDialogue.propTypes = propTypes;

export default injectIntl(FormDialogue);
