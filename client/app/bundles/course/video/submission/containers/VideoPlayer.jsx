import { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux';
import {
  playerStates,
  captionsStates,
  videoDefaults,
  youtubeOpts,
} from 'lib/constants/videoConstants';
import { isPlayingState } from 'lib/helpers/videoHelpers';

import styles from './VideoPlayer.scss';
import {
  changePlayerState,
  changeCaptionsState,
  endSession,
  seekToDirectly,
  sendEvents,
  updatePlayerDuration,
  updateProgressAndBuffer,
} from '../actions/video';
import {
  CaptionsButton,
  NextVideoButton,
  PlayBackRateSelector,
  PlayButton,
  VideoPlayerSlider,
  VideoTimestamp,
  VolumeButton,
  VolumeSlider,
} from './VideoControls';

const tickMilliseconds = 5000;

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
  captionsState: PropTypes.bool,
  forceSeek: PropTypes.bool,
  initialSeekTime: PropTypes.number,
  onPlayerProgress: PropTypes.func,
  onDurationReceived: PropTypes.func,
  onPlayerStateChanged: PropTypes.func,
  onTick: PropTypes.func,
  onUnmount: PropTypes.func,
  directSeek: PropTypes.func,
  setCaptionsState: PropTypes.func,
};

const defaultProps = {
  playerState: playerStates.UNSTARTED,
  playerProgress: 0,
  duration: videoDefaults.placeHolderDuration,
  playerVolume: videoDefaults.volume,
  playbackRate: 1,
  captionsState: captionsStates.NOT_LOADED,
  forceSeek: false,
};

class VideoPlayer extends Component {
  constructor(props) {
    super(props);

    this.player = null;
  }

  UNSAFE_componentWillMount() {
    if (VideoPlayer.ReactPlayer !== undefined) return; // Already loaded

    import(/* webpackChunkName: "video" */ 'react-player').then(
      (ReactPlayer) => {
        VideoPlayer.ReactPlayer = ReactPlayer.default;
        this.forceUpdate();
      },
    );
  }

  componentDidMount() {
    if (this.props.onTick) {
      this.props.onTick();
      window.addEventListener('beforeunload', this.props.onUnmount);
      this.timer = setInterval(this.props.onTick, tickMilliseconds);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.forceSeek) {
      this.player.seekTo(nextProps.playerProgress);
    }

    if (this.props.captionsState !== nextProps.captionsState) {
      this.toggleCaptions(nextProps.captionsState);
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      this.clearInterval(this.timer);
      this.props.onUnmount();
      window.removeEventListener('beforeunload', this.props.onUnmount);
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

  readyCallback = () => {
    if (this.props.initialSeekTime) {
      this.props.directSeek(this.props.initialSeekTime);
    }
  };

  /**
   * Loads or unloads the captions module for Youtube according to whether provided
   * options sets captions to on or off.
   *
   * If captions are not loaded yet, check the component to see if they are present.
   * If so, set captions to OFF to indicate that it's loaded.
   *
   * Only works for Youtube videos.
   * @param captionsState - State of captions to toggle to, if NOT_LOADED is provided, method checks if captions exists
   */
  toggleCaptions = (captionsState) => {
    const internalPlayer = this.player.getInternalPlayer();

    if (
      !internalPlayer ||
      internalPlayer.loadModule === undefined ||
      internalPlayer.unloadModule === undefined ||
      internalPlayer.getOptions === undefined
    ) {
      return;
    }

    if (captionsState === captionsStates.NOT_LOADED) {
      if (internalPlayer.getOptions().includes('captions')) {
        this.props.setCaptionsState(captionsStates.OFF);
      }
    } else if (captionsState === captionsStates.ON) {
      internalPlayer.loadModule('captions');
    } else if (captionsState === captionsStates.OFF) {
      internalPlayer.unloadModule('captions');
    }
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
          onStart={() => {
            this.toggleCaptions(this.props.captionsState);
          }}
          onDuration={this.props.onDurationReceived}
          onProgress={({ playedSeconds, loadedSeconds }) => {
            this.props.onPlayerProgress(playedSeconds, loadedSeconds);
          }}
          onReady={this.readyCallback}
          onPlay={() => this.props.onPlayerStateChanged(playerStates.PLAYING)}
          onPause={() => this.props.onPlayerStateChanged(playerStates.PAUSED)}
          onBuffer={() =>
            this.props.onPlayerStateChanged(playerStates.BUFFERING)
          }
          onEnded={() => this.props.onPlayerStateChanged(playerStates.ENDED)}
          playsinline
          progressInterval={videoDefaults.progressUpdateFrequencyMs}
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
          <VideoTimestamp
            progress={this.props.playerProgress}
            duration={this.props.duration}
          />
          <CaptionsButton />
          <PlayBackRateSelector />
          <NextVideoButton />
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
    onPlayerProgress: (progress, buffered) =>
      dispatch(updateProgressAndBuffer(progress, buffered)),
    onDurationReceived: (duration) => dispatch(updatePlayerDuration(duration)),
    onPlayerStateChanged: (newState) => dispatch(changePlayerState(newState)),
    onTick: () => dispatch(sendEvents()),
    onUnmount: () => dispatch(endSession()),
    directSeek: (playerProgress) => {
      dispatch(seekToDirectly(playerProgress));
    },
    setCaptionsState: (captionsState) => {
      dispatch(changeCaptionsState(captionsState));
    },
  };
}

function mergeProps(stateProps, dispatchProps) {
  if (stateProps.sessionId === null) {
    return { ...stateProps, ...dispatchProps, onTick: null };
  }
  return { ...stateProps, ...dispatchProps };
}

export default connect(
  (state) => state.video,
  mapDispatchToProps,
  mergeProps,
)(VideoPlayer);
