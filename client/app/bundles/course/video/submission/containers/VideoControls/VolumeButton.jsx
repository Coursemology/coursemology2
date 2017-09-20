import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { videoDefaults } from 'lib/constants/videoConstants';

import styles from '../VideoPlayer.scss';
import { changePlayerVolume } from '../../actions/video';

const propTypes = {
  volume: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

function VolumeButton(props) {
  let className = 'fa fa-volume-up';

  if (props.volume === 0) {
    className = 'fa fa-volume-off';
  } else if (props.volume < 0.5) {
    className = 'fa fa-volume-down';
  }

  return (
    <span className={styles.volumeButton} onClick={() => props.onClick(props.volume)}>
      <i className={className} />
    </span>
  );
}

VolumeButton.propTypes = propTypes;

function mapStateToProps(state) {
  return { volume: state.video.playerVolume };
}

function mapDispatchToProps(dispatch) {
  return {
    onClick: (currentVolume) => {
      const newVolume = (currentVolume === 0 ? videoDefaults.volume : 0);
      dispatch(changePlayerVolume(newVolume));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(VolumeButton);
