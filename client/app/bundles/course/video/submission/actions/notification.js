import { notificationActionTypes } from 'lib/constants/videoConstants';

export default function setNotification(message) {
  return (dispatch) => {
    dispatch({
      type: notificationActionTypes.SET_NOTIFICATION,
      message,
    });
  };
}
