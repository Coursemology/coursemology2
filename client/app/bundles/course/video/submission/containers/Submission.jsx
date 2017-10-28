import React from 'react';
import { connect } from 'react-redux';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
import VideoPlayer from './VideoPlayer';
import Discussion from './Discussion';
import styles from './Submission.scss';

const propTypes = {
  notification: notificationShape,
};

function Submission(props) {
  return (
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
}

Submission.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    notification: state.notification,
  };
}

export default connect(mapStateToProps)(Submission);
