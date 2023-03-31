import { connect } from 'react-redux';
import { Pause, PlayArrow } from '@mui/icons-material';
import PropTypes from 'prop-types';

import { playerStates } from 'lib/constants/videoConstants';
import { isPlayingState } from 'lib/helpers/videoHelpers';

import { changePlayerState } from '../../actions/video';

import styles from '../VideoPlayer.scss';

const propTypes = {
  playing: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

const PlayButton = (props) => (
  <span
    className={styles.playButton}
    onClick={() => props.onClick(props.playing)}
  >
    {props.playing ? <Pause /> : <PlayArrow />}
  </span>
);

PlayButton.propTypes = propTypes;

function mapStateToProps(state) {
  return { playing: isPlayingState(state.video.playerState) };
}

function mapDispatchToProps(dispatch) {
  return {
    onClick: (playing) => {
      if (playing) {
        dispatch(changePlayerState(playerStates.PAUSED));
      } else {
        dispatch(changePlayerState(playerStates.PLAYING));
      }
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayButton);
