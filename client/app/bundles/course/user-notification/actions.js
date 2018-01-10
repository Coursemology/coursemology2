/* eslint-disable import/prefer-default-export */
import courseAPI from 'api/course';
import actionTypes from './constants';

export function markAsRead(userNotificationId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.MARK_AS_READ_REQUEST });
    return courseAPI.userNotifications.markAsRead(userNotificationId)
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
