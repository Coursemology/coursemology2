import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

class RailsConfirmationDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: true, disableButtons: false };
    this.onConfirm = this.onConfirm.bind(this);
    this.onConfirmSecondary = this.props.onConfirmSecondaryCallback
      ? this.onConfirmSecondary.bind(this)
      : null;
  }

  // Disable buttons once the confirm button is clicked, then do confirm callback.
  onConfirm() {
    this.setState({ disableButtons: true });
    this.props.onConfirmCallback();
  }

  // Disable buttons once the secondary confirm button is clicked, then do confirm callback.
  onConfirmSecondary() {
    this.setState({ disableButtons: true });
    this.props.onConfirmSecondaryCallback();
  }

  render() {
    return (
      <ConfirmationDialog
        open={this.state.open}
        disableCancelButton={this.state.disableButtons}
        disableConfirmButton={this.state.disableButtons}
        onCancel={() => this.setState({ open: false })}
        onConfirm={this.onConfirm}
        onConfirmSecondary={this.onConfirmSecondary}
        message={this.props.message}
        confirmButtonText={this.props.confirmButtonText}
        confirmSecondaryButtonText={this.props.confirmSecondaryButtonText}
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
