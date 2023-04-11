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
    <span className="ml-2 mr-2">/</span>
    <span className="text-gray-400">{formatTimestamp(props.duration)}</span>
  </span>
);

VideoTimestamp.propTypes = propTypes;

export default VideoTimestamp;
