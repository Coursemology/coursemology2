import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import NotificationBar from 'lib/components/NotificationBar';
import VideoPlayer from './VideoPlayer';
import Discussion from './Discussion';
import styles from './Submission.scss';

const propTypes = {
  notification: PropTypes.object,
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
