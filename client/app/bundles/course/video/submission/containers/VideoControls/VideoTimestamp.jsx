import PropTypes from 'prop-types';
import { formatTimestamp } from 'lib/helpers/videoHelpers';

import styles from '../VideoPlayer.scss';

const propTypes = {
  progress: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
};

function VideoTimestamp(props) {
  return (
    <span className={styles.timestamp}>
      <span>{formatTimestamp(props.progress)}</span>
      <span className="mr-2 ml-2">/</span>
      <span className="text-gray-400">{formatTimestamp(props.duration)}</span>
    </span>
  );
}

VideoTimestamp.propTypes = propTypes;

export default VideoTimestamp;
