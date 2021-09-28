/* eslint-disable import/prefer-default-export */
import courseAPI from 'api/course';
import actionTypes from './constants';

export function fetchNotification() {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_NOTIFICATION_REQUEST });
    return courseAPI.userNotifications
      .fetch()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_NOTIFICATION_SUCCESS,
          nextNotification: response.data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_NOTIFICATION_FAILURE });
      });
  };
}

export function markAsRead(userNotificationId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.MARK_AS_READ_REQUEST });
    return courseAPI.userNotifications
      .markAsRead(userNotificationId)
      .then((response) => {
        dispatch({
          type: actionTypes.MARK_AS_READ_SUCCESS,
          nextNotification: response.data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.MARK_AS_READ_FAILURE });
      });
  };
}
