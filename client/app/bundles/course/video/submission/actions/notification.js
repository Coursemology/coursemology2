import { notificationActionTypes } from 'lib/constants/videoConstants';

export function setNotification(message) {
  return (dispatch) => {
    dispatch({
      type: notificationActionTypes.SET_NOTIFICATION,
      message,
    });
  };
}
