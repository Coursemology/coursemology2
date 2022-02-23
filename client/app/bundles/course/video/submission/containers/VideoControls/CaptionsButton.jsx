import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import { captionsStates } from 'lib/constants/videoConstants';
import { connect } from 'react-redux';
import { grey } from '@material-ui/core/colors';
import ClosedCaption from '@material-ui/icons/ClosedCaption';

import styles from '../VideoPlayer.scss';
import { changeCaptionsState } from '../../actions/video';

const propTypes = {
  captionsState: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

function CaptionsButton(props) {
  if (props.captionsState === captionsStates.NOT_LOADED) {
    return <></>;
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
}

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
