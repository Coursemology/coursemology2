import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { formatTimestamp } from 'lib/helpers/videoHelpers';

import styles from '../VideoPlayer.scss';

const TippedSlider = Slider.createSliderWithTooltip(Slider);
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
  onDragStart: PropTypes.func,
  onDragged: PropTypes.func,
};

const defaultProps = {
  playerProgress: 0,
  bufferProgress: 0,
};

function VideoPlayerSlider(props) {
  return (
    <span className={styles.progressBar}>
      <TippedSlider
        max={props.duration}
        step={1}
        value={props.playerProgress}
        handleStyle={[{ borderColor: playedColour }]}
        trackStyle={{ backgroundColor: playedColour }}
        railStyle={generateRailStyle(props.bufferProgress, props.duration)}
        tipFormatter={formatTimestamp}
        onChange={props.onDragged}
        onBeforeChange={props.onDragStart}
      />
    </span>
  );
}

VideoPlayerSlider.propTypes = propTypes;
VideoPlayerSlider.defaultProps = defaultProps;

export default VideoPlayerSlider;

