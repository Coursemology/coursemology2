import { Component } from 'react';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

class RailsConfirmationDialog extends Component {
  constructor(props) {
    super(props);
    this.state = { open: true, disableButtons: false };
    this.onConfirmSecondary = this.props.onConfirmSecondaryCallback
      ? this.onConfirmSecondary.bind(this)
      : null;
  }

  // Disable buttons once the confirm button is clicked, then do confirm callback.
  onConfirm = () => {
    this.setState({ disableButtons: true });
    this.props.onConfirmCallback();
  };

  // Disable buttons once the secondary confirm button is clicked, then do confirm callback.
  onConfirmSecondary() {
    this.setState({ disableButtons: true });
    this.props.onConfirmSecondaryCallback();
  }

  render() {
    return (
      <ConfirmationDialog
        confirmButtonText={this.props.confirmButtonText}
        confirmSecondaryButtonText={this.props.confirmSecondaryButtonText}
        disableCancelButton={this.state.disableButtons}
        disableConfirmButton={this.state.disableButtons}
        message={this.props.message}
        onCancel={() => this.setState({ open: false })}
        onConfirm={this.onConfirm}
        onConfirmSecondary={this.onConfirmSecondary}
        open={this.state.open}
      />
    );
  }
}

RailsConfirmationDialog.propTypes = {
  onConfirmCallback: PropTypes.func,
  onConfirmSecondaryCallback: PropTypes.func,
  message: PropTypes.string,
  confirmButtonText: PropTypes.string,
  confirmSecondaryButtonText: PropTypes.string,
};

export default RailsConfirmationDialog;
