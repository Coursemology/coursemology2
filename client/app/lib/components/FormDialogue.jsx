import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import formTranslations from 'lib/translations/form';

import modalFormStyles from '../styles/ModalForm.scss';

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
    const { intl, title, disabled, open, submitForm, children } = this.props;
    const formActions = [
      <FlatButton
        key="form-dialogue-cancel-button"
        label={intl.formatMessage(formTranslations.cancel)}
        onClick={this.handleFormClose}
        primary={true}
        {...{ disabled }}
      />,
      <FlatButton
        key="form-dialogue-submit-button"
        ref={(button) => {
          // eslint-disable-next-line react/no-unused-class-component-methods
          this.submitButton = button;
        }}
        keyboardFocused={true}
        label={intl.formatMessage(formTranslations.submit)}
        onClick={submitForm}
        primary={true}
        {...{ disabled }}
      />,
    ];

    return (
      <div>
        <Dialog
          {...{ title, open }}
          actions={formActions}
          autoScrollBodyContent={true}
          bodyClassName={modalFormStyles.modalForm}
          modal={false}
          onRequestClose={this.handleFormClose}
        >
          {children}
        </Dialog>
        <ConfirmationDialog
          confirmDiscard={true}
          onCancel={this.handleDiscardCancel}
          onConfirm={this.handleDiscard}
          open={this.state.discardConfirmationOpen}
        />
      </div>
    );
  }
}

FormDialogue.propTypes = propTypes;

export default injectIntl(FormDialogue);
