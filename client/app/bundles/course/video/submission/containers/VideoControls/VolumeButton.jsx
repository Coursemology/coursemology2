import { connect } from 'react-redux';
import { VolumeDown, VolumeMute, VolumeUp } from '@mui/icons-material';
import PropTypes from 'prop-types';

import { videoDefaults } from 'lib/constants/videoConstants';

import { changePlayerVolume } from '../../actions/video';

import styles from '../VideoPlayer.scss';

const propTypes = {
  volume: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

const VolumeButton = (props) => {
  let classButton = <VolumeUp fontSize="inherit" />;

  if (props.volume === 0) {
    classButton = <VolumeMute fontSize="inherit" />;
  } else if (props.volume < 0.5) {
    classButton = <VolumeDown fontSize="inherit" />;
  }

  return (
    <span
      className={styles.volumeButton}
      onClick={() => props.onClick(props.volume)}
    >
      {classButton}
    </span>
  );
};

VolumeButton.propTypes = propTypes;

function mapStateToProps(state) {
  return { volume: state.video.playerVolume };
}

function mapDispatchToProps(dispatch) {
  return {
    onClick: (currentVolume) => {
      const newVolume = currentVolume === 0 ? videoDefaults.volume : 0;
      dispatch(changePlayerVolume(newVolume));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(VolumeButton);
