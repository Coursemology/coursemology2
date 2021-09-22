import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

class RailsConfirmationDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: true, disableButtons: false };
    this.onConfirm = this.onConfirm.bind(this);
    this.onConfirmCustom = this.props.onConfirmCustomCallback ? this.onConfirmCustom.bind(this) : null;
  }

  // Disable buttons once the confirm button is clicked, then do confirm callback.
  onConfirm() {
    this.setState({ disableButtons: true });
    this.props.onConfirmCallback();
  }

  // Disable buttons once the confirm button is clicked, then do confirm callback.
  onConfirmCustom() {
    this.setState({ disableButtons: true });
    this.props.onConfirmCustomCallback();
  }

  render() {
    return (
      <ConfirmationDialog
        open={this.state.open}
        disableCancelButton={this.state.disableButtons}
        disableConfirmButton={this.state.disableButtons}
        onCancel={() => this.setState({ open: false })}
        onConfirm={this.onConfirm}
        onConfirmCustom={this.onConfirmCustom}
        message={this.props.message}
        confirmButtonText={this.props.confirmButtonText}
        confirmButtonCustomText={this.props.confirmButtonCustomText}
      />
    );
  }
}

RailsConfirmationDialog.propTypes = {
  onConfirmCallback: PropTypes.func,
  onConfirmCustomCallback: PropTypes.func,
  message: PropTypes.string,
  confirmButtonText: PropTypes.string,
  confirmButtonCustomText: PropTypes.string,
};

export default RailsConfirmationDialog;
