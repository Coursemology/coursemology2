import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { sendReminderEmail } from 'course/survey/actions/surveys';

const translations = defineMessages({
  remind: {
    id: 'course.surveys.ResponseIndex.RemindButton.remind',
    defaultMessage: 'Send Reminder Emails',
  },
  explanation: {
    id: 'course.surveys.ResponseIndex.RemindButton.explanation',
    defaultMessage: 'A reminder will be automatically emailed to students who have not completed \
      the survey one day before the survey expires.',
  },
  confirmation: {
    id: 'course.surveys.ResponseIndex.RemindButton.confirmation',
    defaultMessage: 'Send emails to all students who have not completed the survey?',
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

class RemindButton extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleConfirm = () => {
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    this.props.dispatch(sendReminderEmail(successMessage, failureMessage));
    this.setState({ open: false });
  }

  render() {
    return (
      <div>
        <RaisedButton
          label={<FormattedMessage {...translations.remind} />}
          onTouchTap={() => this.setState({ open: true })}
        />
        <ConfirmationDialog
          open={this.state.open}
          message={
            <div>
              <FormattedMessage {...translations.explanation} />
              <br /><br />
              <FormattedMessage {...translations.confirmation} />
            </div>
          }
          onCancel={() => this.setState({ open: false })}
          onConfirm={this.handleConfirm}
        />
      </div>
    );
  }
}

export default connect()(RemindButton);
