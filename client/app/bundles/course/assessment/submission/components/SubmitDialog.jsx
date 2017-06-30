import React, { Component } from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

export default class SubmitDialog extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };

  render() {
    const { open, onCancel, onConfirm } = this.props;
    return (
      <ConfirmationDialog
        open={open}
        onCancel={onCancel}
        onConfirm={onConfirm}
        message="THIS ACTION IS IRREVERSIBLE Are you sure you want to submit? You will no longer be able to amend your submission!"
        cancelButtonText="cancel"
        confirmButtonText="continue"
      />
    );
  }
}
