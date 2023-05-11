import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import { Button, IconButton } from '@mui/material';
import PropTypes from 'prop-types';

import { unsubmitResponse } from 'course/survey/actions/responses';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

const styles = {
  formButton: {
    marginRight: 10,
  },
};

const translations = defineMessages({
  unsubmit: {
    id: 'course.survey.UnsubmitButton.unsubmit',
    defaultMessage: 'Unsubmit',
  },
  unsubmitSuccess: {
    id: 'course.survey.UnsubmitButton.unsubmitSuccess',
    defaultMessage: 'The response has been unsubmitted.',
  },
  unsubmitFailure: {
    id: 'course.survey.UnsubmitButton.unsubmitFailure',
    defaultMessage: 'Unsubmit Failed.',
  },
  confirm: {
    id: 'course.survey.UnsubmitButton.confirm',
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
    const { color, disabled, isIcon, responseId } = this.props;
    return (
      <>
        {isIcon ? (
          <span className="unsubmit-button" data-tooltip-id="unsubmit-button">
            <IconButton
              disabled={disabled}
              id={`unsubmit-button-${responseId}`}
              onClick={() => this.setState({ open: true })}
              size="large"
              style={styles.formButton}
            >
              <RemoveCircle
                htmlColor={!disabled && color ? color : undefined}
              />
            </IconButton>
          </span>
        ) : (
          <Button
            color="secondary"
            disabled={disabled}
            onClick={() => this.setState({ open: true })}
            style={styles.formButton}
            variant="contained"
          >
            <FormattedMessage {...translations.unsubmit} />
          </Button>
        )}
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
  isIcon: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  responseId: PropTypes.number.isRequired,
  color: PropTypes.string,
};

export default connect(({ surveys }) => ({
  disabled: surveys.surveysFlags.isUnsubmittingResponse,
}))(UnsubmitButton);
