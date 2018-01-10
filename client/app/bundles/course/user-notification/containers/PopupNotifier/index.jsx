import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AchievementGainedPopup from 'course/user-notification/components/AchievementGainedPopup';
import LevelReachedPopup from 'course/user-notification/components/LevelReachedPopup';
import { markAsRead } from 'course/user-notification/actions';

class PopupNotifier extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    notification: PropTypes.shape(),
    open: PropTypes.bool,
  }

  static popupsHash = {
    achievementGained: AchievementGainedPopup,
    levelReached: LevelReachedPopup,
  };

  render() {
    const { dispatch, notification, open } = this.props;
    if (!open) { return null; }
    const PopupContent = PopupNotifier.popupsHash[notification.notificationType];
    return (
      <PopupContent
        notification={notification}
        onDismiss={() => { dispatch(markAsRead(notification.id)); }}
      />
    );
  }
}

export default connect(state => ({
  notification: state.popupNotification,
  open: state.popupOpen,
}))(PopupNotifier);
