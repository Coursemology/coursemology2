import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import { red500 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import { unsubmitResponse } from 'course/survey/actions/responses';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

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
    defaultMessage:
      'Once unsubmitted, you will not be able to submit on behalf of a student. \
      Are you sure that you want to unsubmit?',
  },
});

class UnsubmitButton extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleUnsubmitResponse = () => {
    const { dispatch, responseId } = this.props;
    const { unsubmitSuccess, unsubmitFailure } = translations;
    const successMessage = <FormattedMessage {...unsubmitSuccess} />;
    const failureMessage = <FormattedMessage {...unsubmitFailure} />;

    this.setState({ open: false });
    return dispatch(
      unsubmitResponse(responseId, successMessage, failureMessage),
    );
  };

  render() {
    const { isUnsubmitting } = this.props;
    return (
      <>
        <RaisedButton
          buttonStyle={styles.unsubmitButton}
          disabled={isUnsubmitting}
          label={<FormattedMessage {...translations.unsubmit} />}
          onClick={() => this.setState({ open: true })}
          primary={true}
          style={styles.formButton}
        />
        <ConfirmationDialog
          message={<FormattedMessage {...translations.confirm} />}
          onCancel={() => this.setState({ open: false })}
          onConfirm={this.handleUnsubmitResponse}
          open={this.state.open}
        />
      </>
    );
  }
}

UnsubmitButton.propTypes = {
  responseId: PropTypes.number.isRequired,

  isUnsubmitting: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  isUnsubmitting: state.surveysFlags.isUnsubmittingResponse,
}))(UnsubmitButton);
