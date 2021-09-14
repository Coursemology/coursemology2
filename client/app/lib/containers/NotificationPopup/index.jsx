import React from 'react';
import { connect } from 'react-redux';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';

const NotificationPopup = ({ notification }) => (
  <NotificationBar notification={notification} />
);

NotificationPopup.propTypes = {
  notification: notificationShape,
};

export default connect((state) => ({
  notification: state.notificationPopup,
}))(NotificationPopup);
