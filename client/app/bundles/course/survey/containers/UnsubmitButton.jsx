import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { red500 } from 'material-ui/styles/colors';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { unsubmitResponse } from 'course/survey/actions/responses';

const styles = {
  formButton: {
    marginRight: 10,
  },
  unsubmitButton: {
    backgroundColor: red500,
  },
};

const translations = defineMessages({
  unsubmit: {
    id: 'course.surveys.UnsubmitButton.unsubmit',
    defaultMessage: 'Unsubmit',
  },
  unsubmitSuccess: {
    id: 'course.surveys.UnsubmitButton.unsubmitSuccess',
    defaultMessage: 'The response has been unsubmitted.',
  },
  unsubmitFailure: {
    id: 'course.surveys.UnsubmitButton.unsubmitFailure',
    defaultMessage: 'Unsubmit Failed.',
  },
  confirm: {
    id: 'course.surveys.UnsubmitButton.confirm',
    defaultMessage: 'Once unsubmitted, you will not be able to submit on behalf of a student. \
      Are you sure that you want to unsubmit?',
  },
});


class UnsubmitButton extends React.Component {
  static propTypes = {
    responseId: PropTypes.number.isRequired,

    isUnsubmitting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleUnsubmitResponse = () => {
    const { dispatch, responseId } = this.props;
    const { unsubmitSuccess, unsubmitFailure } = translations;
    const successMessage = <FormattedMessage {...(unsubmitSuccess)} />;
    const failureMessage = <FormattedMessage {...(unsubmitFailure)} />;

    this.setState({ open: false });
    return dispatch(
      unsubmitResponse(responseId, successMessage, failureMessage)
    );
  }

  render() {
    const { isUnsubmitting } = this.props;
    return (
      <div>
        <RaisedButton
          primary
          onTouchTap={() => this.setState({ open: true })}
          style={styles.formButton}
          buttonStyle={styles.unsubmitButton}
          label={<FormattedMessage {...translations.unsubmit} />}
          disabled={isUnsubmitting}
        />
        <ConfirmationDialog
          message={<FormattedMessage {...translations.confirm} />}
          open={this.state.open}
          onCancel={() => this.setState({ open: false })}
          onConfirm={this.handleUnsubmitResponse}
        />
      </div>
    );
  }
}

export default connect(state => (
  { isUnsubmitting: state.surveysFlags.isUnsubmittingResponse }
)
)(UnsubmitButton);
