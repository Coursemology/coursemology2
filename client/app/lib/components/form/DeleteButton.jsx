import React, { PropTypes } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { Button, Glyphicon } from 'react-bootstrap';

const messages = defineMessages({
  deleteConfirmation: {
    id: 'lib.form.components.buttons.deleteButtonConfirmation',
    defaultMessage: 'Confirm delete?',
    description: 'Confirmation message for delete button',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  path: PropTypes.string.isRequired,
  confirmationMessage: PropTypes.string,
};

const DeleteButton = ({ path, confirmationMessage, intl }) => {
  const defaultMessage = intl.formatMessage(messages.deleteConfirmation);
  return (
    <Button
      href={path}
      data-method="delete"
      data-confirm={confirmationMessage || defaultMessage}
      bsSize="small"
      bsStyle="danger"
    >
      <Glyphicon glyph="trash" />
    </Button>
  );
};

DeleteButton.propTypes = propTypes;

export default injectIntl(DeleteButton);
