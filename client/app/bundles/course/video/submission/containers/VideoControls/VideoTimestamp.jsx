import PropTypes from 'prop-types';

import { formatTimestamp } from 'lib/helpers/videoHelpers';

import styles from '../VideoPlayer.scss';

const propTypes = {
  progress: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
};

const VideoTimestamp = (props) => (
  <span className={styles.timestamp}>
    <span>{formatTimestamp(props.progress)}</span>
    <span style={{ marginLeft: '0.5em', marginRight: '0.5em' }}>/</span>
    <span style={{ color: 'grey' }}>{formatTimestamp(props.duration)}</span>
  </span>
);

VideoTimestamp.propTypes = propTypes;

export default VideoTimestamp;
