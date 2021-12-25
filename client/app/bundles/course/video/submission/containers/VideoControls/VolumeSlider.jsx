import { connect } from 'react-redux';
import Slider from 'material-ui/Slider';
import PropTypes from 'prop-types';

import { changePlayerVolume } from '../../actions/video';

import styles from '../VideoPlayer.scss';

const propTypes = {
  volume: PropTypes.number.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
  fineTuningScale: PropTypes.number,
};

const defaultProps = {
  fineTuningScale: 100,
};

const VolumeSlider = (props) => (
  <span className={styles.volumeSlider}>
    <Slider
      max={props.fineTuningScale}
      min={0}
      onChange={(_, newValue) => {
        props.onVolumeChange(newValue / props.fineTuningScale);
      }}
      sliderStyle={{ margin: 0 }}
      step={1}
      value={props.volume * props.fineTuningScale}
    />
  </span>
);

VolumeSlider.propTypes = propTypes;
VolumeSlider.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  return {
    volume: state.video.playerVolume,
    fineTuningScale: ownProps.fineTuningScale,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onVolumeChange: (newVolume) => dispatch(changePlayerVolume(newVolume)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(VolumeSlider);
