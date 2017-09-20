import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'material-ui/Slider';

import styles from '../VideoPlayer.scss';

const propTypes = {
  volume: PropTypes.number.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
  fineTuningScale: PropTypes.number,
};

const defaultProps = {
  fineTuningScale: 100,
};

function VolumeSlider(props) {
  return (
    <span className={styles.volumeSlider}>
      <Slider
        min={0}
        max={props.fineTuningScale}
        step={1}
        value={props.volume * props.fineTuningScale}
        sliderStyle={{ margin: 0 }}
        onChange={(_, newValue) => {
          props.onVolumeChange(newValue / props.fineTuningScale);
        }}
      />
    </span>
  );
}

VolumeSlider.propTypes = propTypes;
VolumeSlider.defaultProps = defaultProps;

export default VolumeSlider;
