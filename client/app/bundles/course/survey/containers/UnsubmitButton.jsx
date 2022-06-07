import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button, IconButton } from '@mui/material';
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { unsubmitResponse } from 'course/survey/actions/responses';

const styles = {
  formButton: {
    marginRight: 10,
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
    const { color, disabled, isIcon, responseId } = this.props;
    return (
      <>
        {isIcon ? (
          <span className="unsubmit-button" data-for="unsubmit-button" data-tip>
            <IconButton
              id={`unsubmit-button-${responseId}`}
              disabled={disabled}
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
            variant="contained"
            color="secondary"
            disabled={disabled}
            onClick={() => this.setState({ open: true })}
            style={styles.formButton}
          >
            <FormattedMessage {...translations.unsubmit} />
          </Button>
        )}
        <ConfirmationDialog
          message={<FormattedMessage {...translations.confirm} />}
          open={this.state.open}
          onCancel={() => this.setState({ open: false })}
          onConfirm={this.handleUnsubmitResponse}
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

export default connect((state) => ({
  disabled: state.surveysFlags.isUnsubmittingResponse,
}))(UnsubmitButton);
