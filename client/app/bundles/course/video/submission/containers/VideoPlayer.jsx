import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import { timeIsPastRestricted } from 'lib/helpers/videoHelpers';

import styles from './VideoPlayer.scss';
import { videoDefaults, youtubeOpts } from '../constants';

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
  restrictContentAfter: PropTypes.number,
  updateTimestamp: PropTypes.func,
};

class VideoPlayer extends React.Component {
  /**
   * Expose PlayerState constants for convenience. These constants can also be
   * accessed through the global YT object after the YouTube IFrame API is instantiated.
   * https://developers.google.com/youtube/iframe_api_reference#onStateChange
   */
  static PlayerState = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
  };

  constructor(props) {
    super(props);

    this.player = null;
    this.preDragState = VideoPlayer.PlayerState.PLAYING;

    this.state = {
      playerState: VideoPlayer.PlayerState.UNSTARTED,
      playerProgress: 0,
      duration: 600,
      bufferProgress: 0,
      playerVolume: videoDefaults.volume,
      playbackRate: 1,
      playsInline: true,
      progressFrequency: 500,
    };
  }

  componentWillMount() {
    if (VideoPlayer.ReactPlayer !== undefined) return; // Already loaded

    import(/* webpackChunkName: "video" */ 'react-player').then((ReactPlayer) => {
      VideoPlayer.ReactPlayer = ReactPlayer.default;
      this.forceUpdate();
    });
  }

  /**
   * This is the call back passed to ReactPlayer that is called in intervals as the player plays.
   *
   * The update interval is specified by progressFrequency property.
   * @param {Object} progressStats - Progress of the video as played, playedSeconds, loaded, and
   * loadedSeconds, specifying the interval and absolute time of the progress respectively
   */
  onPlayerProgress = (progressStats) => {
    const { playedSeconds, loadedSeconds } = progressStats;

    let targetTime = (playedSeconds === undefined) ? 0 : playedSeconds;
    let playerState = this.state.playerState;
    if (timeIsPastRestricted(this.props.restrictContentAfter, playedSeconds)) {
      targetTime = this.props.restrictContentAfter;
      playerState = VideoPlayer.PlayerState.PAUSED;
      this.player.seekTo(targetTime);
    }

    this.setState(oldState => ({
      playerState,
      playerProgress: targetTime,
      bufferProgress: ((loadedSeconds === undefined) ? oldState.bufferProgress : loadedSeconds),
    }));

    if (this.props.updateTimestamp) {
      this.props.updateTimestamp(targetTime);
    }
  };

  onPlayButtonClick = () => {
    if (this.isPlayingState()) {
      this.setState({ playerState: VideoPlayer.PlayerState.PAUSED });
    } else if (!timeIsPastRestricted(this.props.restrictContentAfter, this.state.playerProgress)) {
      this.setState({ playerState: VideoPlayer.PlayerState.PLAYING });
    }
  };

  onVolumeButtonClick = () => {
    const newVolume = this.state.playerVolume === 0 ? videoDefaults.volume : 0;
    this.setState({ playerVolume: newVolume });
  };

  onVolumeSliderChange = (newVolume) => {
    this.setState({ playerVolume: newVolume });
  };

  onPlayRateChange = (newRate) => {
    this.setState({ playbackRate: newRate });
  };

  onVideoSliderChange = (newValue) => {
    let newPlayerProgress = (newValue && newValue >= 0) ? newValue : 0;
    let playerState = this.preDragState;
    if (timeIsPastRestricted(this.props.restrictContentAfter, newPlayerProgress)) {
      newPlayerProgress = this.props.restrictContentAfter;
      playerState = VideoPlayer.PlayerState.PAUSED;
    }
    this.player.seekTo(newPlayerProgress);
    this.setState({ playerProgress: newPlayerProgress, playerState });
  };

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

  /**
   * Returns if the playerState stored is a state that indicates the player is playing.
   * @returns {boolean} - true if player is playing
   */
  isPlayingState() {
    switch (this.state.playerState) {
      case VideoPlayer.PlayerState.PLAYING:
      case VideoPlayer.PlayerState.BUFFERING:
        return true;
      default:
        return false;
    }
  }

  render() {
    // do not attempt to create a player server-side, it won't work
    if (typeof document === 'undefined') return null;
    if (typeof VideoPlayer.ReactPlayer === 'undefined') return null;

    const videoPlayer = (
      <VideoPlayer.ReactPlayer
        ref={this.setRef}
        url={this.props.videoUrl}
        playing={this.isPlayingState()}
        volume={this.state.playerVolume}
        playbackRate={this.state.playbackRate}
        playsinline={this.state.playsInline}
        progressFrequency={this.state.progressFrequency}
        onProgress={this.onPlayerProgress}
        onDuration={duration => this.setState({ duration })}
        onPlay={() => this.setState({ playerState: VideoPlayer.PlayerState.PLAYING })}
        onPause={() => this.setState({ playerState: VideoPlayer.PlayerState.PAUSED })}
        onBuffer={() => {
          // It doesn't matter if video is buffering if we aren't even playing it
          if (this.isPlayingState()) {
            this.setState({ playerState: VideoPlayer.PlayerState.BUFFERING });
          }
        }}
        onEnded={() => this.setState({ playerState: VideoPlayer.PlayerState.ENDED })}
        config={{ youtube: youtubeOpts }}
      />
    );

    const controls = (
      <div className={styles.controlsContainer}>
        <div className={styles.progressBar}>
          <VideoPlayerSlider
            duration={this.state.duration}
            playerProgress={this.state.playerProgress}
            restrict={this.props.restrictContentAfter}
            bufferProgress={this.state.bufferProgress}
            onDragStart={() => {
              this.preDragState = this.state.playerState;
            }}
            onDragged={this.onVideoSliderChange}
          />
        </div>
        <div className={styles.controlsRow}>
          <PlayButton playing={this.isPlayingState()} onClick={this.onPlayButtonClick} />
          <VolumeButton volume={this.state.playerVolume} onClick={this.onVolumeButtonClick} />
          <VolumeSlider
            volume={this.state.playerVolume}
            onVolumeChange={this.onVolumeSliderChange}
          />
          <VideoTimestamp progress={this.state.playerProgress} duration={this.state.duration} />
          <PlayBackRateSelector
            rate={this.state.playbackRate}
            rateChanged={this.onPlayRateChange}
          />
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

export default VideoPlayer;
