import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import translations from '../translations';

class SubmitDialog extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };

  render() {
    const { intl, open, onCancel, onConfirm } = this.props;
    return (
      <ConfirmationDialog
        open={open}
        onCancel={onCancel}
        onConfirm={onConfirm}
        message={intl.formatMessage(translations.submitConfirmation)}
        cancelButtonText="cancel"
        confirmButtonText="continue"
      />
    );
  }
}

export default injectIntl(SubmitDialog);
