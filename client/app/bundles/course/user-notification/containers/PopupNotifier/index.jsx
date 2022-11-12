import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  fetchNotification,
  markAsRead,
} from 'course/user-notification/actions';
import AchievementGainedPopup from 'course/user-notification/components/AchievementGainedPopup';
import LevelReachedPopup from 'course/user-notification/components/LevelReachedPopup';

class PopupNotifier extends Component {
  static popupsHash = {
    achievementGained: AchievementGainedPopup,
    levelReached: LevelReachedPopup,
  };

  componentDidMount() {
    this.props.dispatch(fetchNotification());
  }

  render() {
    const { dispatch, notification, open } = this.props;
    if (!open) {
      return null;
    }
    const PopupContent =
      PopupNotifier.popupsHash[notification.notificationType];
    return (
      <PopupContent
        notification={notification}
        onDismiss={() => {
          dispatch(markAsRead(notification.id));
        }}
      />
    );
  }
}

PopupNotifier.propTypes = {
  dispatch: PropTypes.func,
  notification: PropTypes.shape(),
  open: PropTypes.bool,
};

export default connect((state) => ({
  notification: state.popupNotification,
  open: state.popupOpen,
}))(PopupNotifier);
