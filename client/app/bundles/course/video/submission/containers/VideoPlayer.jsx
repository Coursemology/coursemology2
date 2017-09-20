import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux';
import { playerStates, videoDefaults, youtubeOpts } from 'lib/constants/videoConstants';
import { isPlayingState } from 'lib/helpers/videoHelpers';

import styles from './VideoPlayer.scss';
import { changePlayerState, updatePlayerDuration, updateProgressAndBuffer } from '../actions/video';
import {
  PlayBackRateSelector,
  PlayButton,
  VideoPlayerSlider,
  VideoTimestamp,
  VolumeButton,
  VolumeSlider,
} from './VideoControls';

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
};

const defaultProps = {
  playerState: playerStates.UNSTARTED,
  playerProgress: 0,
  duration: videoDefaults.placeHolderDuration,
  bufferProgress: 0,
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.forceSeek) {
      this.player.seekTo(nextProps.playerProgress);
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
        config={{ youtube: youtubeOpts }}
      />
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
      <Paper zDepth={2} style={{ width: '640px' }}>
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
  };
}

export default connect(state => state.video, mapDispatchToProps)(VideoPlayer);
