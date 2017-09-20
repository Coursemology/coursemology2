import React from 'react';
import PropTypes from 'prop-types';

import styles from '../VideoPlayer.scss';

const propTypes = {
  playing: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

function PlayButton(props) {
  const playIconClass = props.playing ? 'fa fa-pause' : 'fa fa-play';
  return (
    <span className={styles.playButton} onClick={props.onClick}>
      <i className={playIconClass} />
    </span>
  );
}

PlayButton.propTypes = propTypes;

export default PlayButton;
