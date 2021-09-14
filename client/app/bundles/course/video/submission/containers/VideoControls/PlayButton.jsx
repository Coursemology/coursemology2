import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { playerStates } from 'lib/constants/videoConstants';
import { isPlayingState } from 'lib/helpers/videoHelpers';

import styles from '../VideoPlayer.scss';
import { changePlayerState } from '../../actions/video';

const propTypes = {
  playing: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

function PlayButton(props) {
  const playIconClass = props.playing ? 'fa fa-pause' : 'fa fa-play';
  return (
    <span
      className={styles.playButton}
      onClick={() => props.onClick(props.playing)}
    >
      <i className={playIconClass} />
    </span>
  );
}

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
