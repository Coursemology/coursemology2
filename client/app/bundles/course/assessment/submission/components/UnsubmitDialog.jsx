import React, { Component } from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

export default class UnsubmitDialog extends Component {
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
        message="This will reset the submission time and permit the student to change his submission. NOTE THAT YOU CANNOT UNDO THIS!! Are you sure you want to proceed?"
        cancelButtonText="cancel"
        confirmButtonText="continue"
      />
    );
  }
}
