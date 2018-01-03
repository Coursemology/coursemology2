import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux';
import { playerStates, videoDefaults, youtubeOpts } from 'lib/constants/videoConstants';
import { isPlayingState } from 'lib/helpers/videoHelpers';

import styles from './VideoPlayer.scss';
import { changePlayerState, sendEvents, updatePlayerDuration, updateProgressAndBuffer } from '../actions/video';
import {
  PlayBackRateSelector,
  PlayButton,
  VideoPlayerSlider,
  VideoTimestamp,
  VolumeButton,
  VolumeSlider,
} from './VideoControls';

const tickMilliseconds = 1000;

const reactPlayerStyle = {
  position: 'absolute',
  top: '0',
  left: '0',
  height: '100%',
  width: '100%',
};

const propTypes = {
  videoUrl: PropTypes.string.isRequired,
  playerState: PropTypes.oneOf(Object.values(playerStates)),
  playerProgress: PropTypes.number,
  duration: PropTypes.number,
  playerVolume: PropTypes.number,
  playbackRate: PropTypes.number,
  forceSeek: PropTypes.bool,
  onPlayerProgress: PropTypes.func,
  onDurationReceived: PropTypes.func,
  onPlayerStateChanged: PropTypes.func,
  onTick: PropTypes.func,
};

const defaultProps = {
  playerState: playerStates.UNSTARTED,
  playerProgress: 0,
  duration: videoDefaults.placeHolderDuration,
  playerVolume: videoDefaults.volume,
  playbackRate: 1,
  forceSeek: false,
};

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.player = null;
  }

  componentWillMount() {
    if (VideoPlayer.ReactPlayer !== undefined) return; // Already loaded

    import(/* webpackChunkName: "video" */ 'react-player').then((ReactPlayer) => {
      VideoPlayer.ReactPlayer = ReactPlayer.default;
      this.forceUpdate();
    });
  }

  componentDidMount() {
    if (this.props.onTick) {
      this.timer = setInterval(this.props.onTick, tickMilliseconds);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.forceSeek) {
      this.player.seekTo(nextProps.playerProgress);
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      this.clearInterval(this.timer);
      this.props.onTick(); // Will not be null as long as timer exists.
    }
  }

  /**
   * Sets a ref so we can control the player.
   *
   * The player is a "partially controlled" component. It has it's own states for play time so
   * we can simply manage play state in this component. As such, we need references to seek.
   * @param player - The player element
   */
  setRef = (player) => {
    this.player = player;
  };

  render() {
    // do not attempt to create a player server-side, it won't work
    if (typeof document === 'undefined') return null;
    if (typeof VideoPlayer.ReactPlayer === 'undefined') return null;

    const videoPlayer = (
      <div className={styles.playerContainer}>
        <VideoPlayer.ReactPlayer
          ref={this.setRef}
          url={this.props.videoUrl}
          playing={isPlayingState(this.props.playerState)}
          volume={this.props.playerVolume}
          playbackRate={this.props.playbackRate}
          onDuration={this.props.onDurationReceived}
          onProgress={({ playedSeconds, loadedSeconds }) => {
            this.props.onPlayerProgress(playedSeconds, loadedSeconds);
          }}
          onPlay={() => this.props.onPlayerStateChanged(playerStates.PLAYING)}
          onPause={() => this.props.onPlayerStateChanged(playerStates.PAUSED)}
          onBuffer={() => this.props.onPlayerStateChanged(playerStates.BUFFERING)}
          onEnded={() => this.props.onPlayerStateChanged(playerStates.ENDED)}
          playsinline
          progressFrequency={videoDefaults.progressUpdateFrequencyMs}
          style={reactPlayerStyle}
          width="100%"
          height="100%"
          config={{ youtube: youtubeOpts }}
        />
      </div>
    );

    const controls = (
      <div className={styles.controlsContainer}>
        <div className={styles.progressBar}>
          <VideoPlayerSlider />
        </div>
        <div className={styles.controlsRow}>
          <PlayButton />
          <VolumeButton />
          <VolumeSlider />
          <VideoTimestamp progress={this.props.playerProgress} duration={this.props.duration} />
          <PlayBackRateSelector />
        </div>
      </div>
    );

    return (
      <Paper zDepth={2} className={styles.videoPaperContainer}>
        {videoPlayer}
        {controls}
      </Paper>
    );
  }
}

VideoPlayer.propTypes = propTypes;
VideoPlayer.defaultProps = defaultProps;

function mapDispatchToProps(dispatch) {
  return {
    onPlayerProgress: (progress, buffered) => dispatch(updateProgressAndBuffer(progress, buffered)),
    onDurationReceived: duration => dispatch(updatePlayerDuration(duration)),
    onPlayerStateChanged: newState => dispatch(changePlayerState(newState)),
    onTick: () => dispatch(sendEvents()),
  };
}

function mergeProps(stateProps, dispatchProps) {
  if (stateProps.sessionId === null) {
    return Object.assign({}, stateProps, dispatchProps, { onTick: null });
  }
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(state => state.video, mapDispatchToProps, mergeProps)(VideoPlayer);
