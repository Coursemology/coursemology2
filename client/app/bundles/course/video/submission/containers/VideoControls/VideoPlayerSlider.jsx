import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatTimestamp } from 'lib/helpers/videoHelpers';
import 'rc-slider/assets/index.css';

import styles from '../VideoPlayer.scss';
import { seekEnd, seekStart, updatePlayerProgress } from '../../actions/video';

const unbufferedColour = '#e9e9e9';
const bufferedColour = '#afe9ff';
const playedColour = '#00bcd4';

function generateRailStyle(buffered, total) {
  const bufferedFrac = (total === 0 || buffered > total) ? 1 : buffered / total;
  const unbufferedFrac = 1 - bufferedFrac;

  if (bufferedFrac < 0.5) {
    return {
      backgroundImage: `linear-gradient(270deg, ${unbufferedColour} ${unbufferedFrac * 100}%,` +
      ` ${bufferedColour} ${bufferedFrac * 100}%)`,
    };
  }
  return {
    backgroundImage: `linear-gradient(90deg, ${bufferedColour} ${bufferedFrac * 100}%,` +
    ` ${unbufferedColour} ${unbufferedFrac * 100}%)`,
  };
}

const propTypes = {
  duration: PropTypes.number.isRequired,
  playerProgress: PropTypes.number,
  bufferProgress: PropTypes.number,
  onDragged: PropTypes.func,
  onDragBegin: PropTypes.func,
  onDragStop: PropTypes.func,
};

const defaultProps = {
  playerProgress: 0,
  bufferProgress: 0,
};

class VideoPlayerSlider extends React.Component {
  componentWillMount() {
    if (VideoPlayerSlider.TippedSlider !== undefined) return; // Already loaded

    import(/* webpackChunkName: "video" */ 'rc-slider').then((rcSlider) => {
      const Slider = rcSlider.default;
      VideoPlayerSlider.TippedSlider = Slider.createSliderWithTooltip(Slider);
      this.forceUpdate();
    });
  }

  render() {
    if (VideoPlayerSlider.TippedSlider === undefined) return null;

    return (
      <span className={styles.progressBar}>
        <VideoPlayerSlider.TippedSlider
          max={this.props.duration}
          step={1}
          value={this.props.playerProgress}
          handleStyle={[{ borderColor: playedColour }]}
          trackStyle={{ backgroundColor: playedColour }}
          railStyle={generateRailStyle(this.props.bufferProgress, this.props.duration)}
          tipFormatter={formatTimestamp}
          onChange={this.props.onDragged}
          onBeforeChange={this.props.onDragBegin}
          onAfterChange={this.props.onDragStop}
        />
      </span>
    );
  }
}

VideoPlayerSlider.propTypes = propTypes;
VideoPlayerSlider.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    duration: state.video.duration,
    playerProgress: state.video.playerProgress,
    bufferProgress: state.video.bufferProgress,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onDragBegin: () => dispatch(seekStart()),
    onDragged: newValue => dispatch(updatePlayerProgress(newValue, true)),
    onDragStop: () => dispatch(seekEnd()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoPlayerSlider);

