import { connect } from 'react-redux';

import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';

import Discussion from './Discussion';
import VideoPlayer from './VideoPlayer';
import styles from './Submission.scss';

const propTypes = {
  notification: notificationShape,
};

const Submission = (props) => (
  <div className={styles.submissionContainer}>
    <div className={styles.videoAndAnswers}>
      <VideoPlayer />
    </div>
    <div className={styles.discussion}>
      <Discussion />
    </div>
    <NotificationBar notification={props.notification} />
  </div>
);

Submission.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    notification: state.notification,
  };
}

export default connect(mapStateToProps)(Submission);
