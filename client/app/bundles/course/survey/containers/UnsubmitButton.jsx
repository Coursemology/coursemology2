import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { IconButton } from '@mui/material';
import RemoveCircle from '@mui/icons-material/RemoveCircle';

import { unsubmitResponse } from 'course/survey/actions/responses';

const styles = {
  formButton: {
    padding: '0.25em 0.4em',
  },
};

class UnsubmitButton extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleUnsubmitResponse = () => {
    const { dispatch, buttonId } = this.props;
    const { unsubmitSuccess, unsubmitFailure } = translations;
    const successMessage = <FormattedMessage {...unsubmitSuccess} />;
    const failureMessage = <FormattedMessage {...unsubmitFailure} />;

    this.setState({ open: false });
    return dispatch(
      unsubmitResponse(buttonId, successMessage, failureMessage),
    );
  };

  render() {
    const { isUnsubmitting } = this.props;
    return (
      <>
        <span className="unsubmit-button" data-for="unsubmit-button" data-tip>
          <IconButton
            id={`unsubmit-button-${this.props.buttonId}`}
            disabled={isUnsubmitting}
            onClick={() => this.props.setState({ ...this.props.state, unsubmitConfirmation: true })}
            size="large"
            style={styles.formButton}
          >
            <RemoveCircle
              htmlColor={isUnsubmitting ? undefined : this.props.color}
            />
          </IconButton>
        </span>


      </>
    );
  }
}

UnsubmitButton.propTypes = {
  buttonId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  isUnsubmitting: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
};

export default connect((state, ownProps) => ({
  isUnsubmitting: state.surveysFlags ? state.surveysFlags.isUnsubmittingResponse : ownProps.isUnsubmitting,
}))(UnsubmitButton);
