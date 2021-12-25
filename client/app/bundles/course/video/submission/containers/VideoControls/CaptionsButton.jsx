import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import { black, grey400 } from 'material-ui/styles/colors';
import ClosedCaption from 'material-ui/svg-icons/av/closed-caption';
import PropTypes from 'prop-types';

import { captionsStates } from 'lib/constants/videoConstants';

import { changeCaptionsState } from '../../actions/video';

import styles from '../VideoPlayer.scss';

const propTypes = {
  captionsState: PropTypes.bool.isRequired,
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
        color={props.captionsState === captionsStates.ON ? black : grey400}
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
