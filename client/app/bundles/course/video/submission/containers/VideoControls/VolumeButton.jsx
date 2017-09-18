import React from 'react';
import PropTypes from 'prop-types';

import styles from '../VideoPlayer.scss';

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
    <span className={styles.volumeButton} onClick={props.onClick}>
      <i className={className} />
    </span>
  );
}

VolumeButton.propTypes = propTypes;

export default VolumeButton;
