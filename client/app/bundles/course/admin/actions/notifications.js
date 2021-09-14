/* eslint-disable import/prefer-default-export */
import CourseAPI from 'api/course';
import actionTypes from '../constants';
import { setNotification } from './index';

export function updateNotificationSetting(
  value,
  successMessage,
  failureMessage,
) {
  const payload = { notification_settings: value };
  return (dispatch) => {
    dispatch({ type: actionTypes.NOTIFICATION_SETTING_UPDATE_REQUEST });
    return CourseAPI.admin.notifications
      .update(payload)
      .then((response) => {
        dispatch({
          type: actionTypes.NOTIFICATION_SETTING_UPDATE_SUCCESS,
          updatedSettings: response.data,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.NOTIFICATION_SETTING_UPDATE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
