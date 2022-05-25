import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { IconButton } from '@mui/material';
import RemoveCircle from '@mui/icons-material/RemoveCircle';

const styles = {
  formButton: {
    padding: '0.25em 0.4em',
  },
};

const UnsubmitButton = (props) => {
  const isUnsubmitting =
    useSelector(
      (state) =>
        state.surveysFlags && state.surveysFlags.isUnsubmittingResponse,
    ) || false;
  return (
    <>
      <span className="unsubmit-button" data-for="unsubmit-button" data-tip>
        <IconButton
          id={`unsubmit-button-${props.buttonId}`}
          disabled={isUnsubmitting || props.isUnsubmitting}
          onClick={() =>
            props.setState({
              ...props.state,
              unsubmitConfirmation: true,
            })
          }
          size="large"
          style={styles.formButton}
        >
          <RemoveCircle
            htmlColor={
              isUnsubmitting || props.isUnsubmitting ? undefined : props.color
            }
          />
        </IconButton>
      </span>
    </>
  );
};

UnsubmitButton.propTypes = {
  buttonId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  isUnsubmitting: PropTypes.bool.isRequired,
  setState: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
};

export default UnsubmitButton;
