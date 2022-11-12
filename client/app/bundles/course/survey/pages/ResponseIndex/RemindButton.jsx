import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { sendReminderEmail } from 'course/survey/actions/surveys';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

const translations = defineMessages({
  remind: {
    id: 'course.surveys.ResponseIndex.RemindButton.remind',
    defaultMessage: 'Send Reminder Emails',
  },
  explanation: {
    id: 'course.surveys.ResponseIndex.RemindButton.explanation',
    defaultMessage:
      'A reminder will be automatically emailed to students who have not completed \
      the survey one day before the survey expires.',
  },
  confirmation: {
    id: 'course.surveys.ResponseIndex.RemindButton.confirmation',
    defaultMessage:
      'Send emails to all students (excluding phantoms) who have not completed the survey?',
  },
  confirmationAll: {
    id: 'course.surveys.ResponseIndex.RemindButton.confirmationAll',
    defaultMessage:
      'Send emails to all students (including phantoms) who have not completed the survey?',
  },
  success: {
    id: 'course.surveys.ResponseIndex.RemindButton.success',
    defaultMessage: 'Reminder emails have been dispatched.',
  },
  failure: {
    id: 'course.surveys.ResponseIndex.RemindButton.failure',
    defaultMessage: 'Failed to send reminder.',
  },
});

class RemindButton extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleConfirm = () => {
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    this.props.dispatch(
      sendReminderEmail(
        successMessage,
        failureMessage,
        this.props.includePhantom,
      ),
    );
    this.setState({ open: false });
  };

  render() {
    return (
      <>
        <Button
          onClick={() => this.setState({ open: true })}
          variant="outlined"
        >
          <FormattedMessage {...translations.remind} />
        </Button>
        <ConfirmationDialog
          message={
            <>
              <FormattedMessage {...translations.explanation} />
              <br />
              <br />
              {this.props.includePhantom ? (
                <FormattedMessage {...translations.confirmationAll} />
              ) : (
                <FormattedMessage {...translations.confirmation} />
              )}
            </>
          }
          onCancel={() => this.setState({ open: false })}
          onConfirm={this.handleConfirm}
          open={this.state.open}
        />
      </>
    );
  }
}

RemindButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
  includePhantom: PropTypes.bool.isRequired,
};

export default connect()(RemindButton);
