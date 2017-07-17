/* eslint-disable import/prefer-default-export */
import actionTypes from '../constants';

export function setNotification(message) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_ADMIN_NOTIFICATION,
      message,
    });
  };
}
