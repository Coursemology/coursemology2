import { connect } from 'react-redux';
import ClosedCaption from '@mui/icons-material/ClosedCaption';
import { IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import { captionsStates } from 'lib/constants/videoConstants';

import { changeCaptionsState } from '../../actions/video';

import styles from '../VideoPlayer.scss';

const propTypes = {
  captionsState: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

const CaptionsButton = (props) => {
  if (props.captionsState === captionsStates.NOT_LOADED) {
    return null;
  }
  return (
    <IconButton
      className={styles.captionsButton}
      onClick={() => props.onClick(props.captionsState)}
    >
      <ClosedCaption
        htmlColor={
          props.captionsState === captionsStates.ON ? 'black' : grey[400]
        }
      />
    </IconButton>
  );
};

CaptionsButton.propTypes = propTypes;

function mapStateToProps(state) {
  return { captionsState: state.video.captionsState };
}

function mapDispatchToProps(dispatch) {
  return {
    onClick: (captionsState) => {
      if (captionsState === captionsStates.ON) {
        dispatch(changeCaptionsState(captionsStates.OFF));
      } else if (captionsState === captionsStates.OFF) {
        dispatch(changeCaptionsState(captionsStates.ON));
      }
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CaptionsButton);
