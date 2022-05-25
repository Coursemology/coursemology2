import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton } from '@mui/material';
import RemoveCircle from '@mui/icons-material/RemoveCircle';

const styles = {
  formButton: {
    padding: '0.25em 0.4em',
  },
};

class UnsubmitButton extends Component {
  render() {
    const { isUnsubmitting } = this.props;
    return (
      <>
        <span className="unsubmit-button" data-for="unsubmit-button" data-tip>
          <IconButton
            id={`unsubmit-button-${this.props.buttonId}`}
            disabled={isUnsubmitting}
            onClick={() =>
              this.props.setState({
                ...this.props.state,
                unsubmitConfirmation: true,
              })
            }
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
  setState: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
};

export default connect((state, ownProps) => ({
  isUnsubmitting: state.surveysFlags
    ? state.surveysFlags.isUnsubmittingResponse
    : ownProps.isUnsubmitting,
}))(UnsubmitButton);
