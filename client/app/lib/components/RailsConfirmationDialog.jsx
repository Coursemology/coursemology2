import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

class RailsConfirmationDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: true, disableButtons: false };
    this.onConfirm = this.onConfirm.bind(this);
  }

  // Disable buttons once the confirm button is clicked, then do confirm callback.
  onConfirm() {
    this.setState({ disableButtons: true });
    this.props.onConfirmCallback();
  }

  render() {
    return (
      <ConfirmationDialog
        open={this.state.open}
        disableCancelButton={this.state.disableButtons}
        disableConfirmButton={this.state.disableButtons}
        onCancel={() => this.setState({ open: false })}
        onConfirm={this.onConfirm}
        message={this.props.message}
      />
    );
  }
}

RailsConfirmationDialog.propTypes = {
  onConfirmCallback: PropTypes.func,
  message: PropTypes.string,
};

export default RailsConfirmationDialog;
