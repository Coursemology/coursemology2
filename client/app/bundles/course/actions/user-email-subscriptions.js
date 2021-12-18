/* eslint-disable import/prefer-default-export */
import CourseAPI from 'api/course';
import actionTypes from '../constants';
import { setNotification } from './index';

export function fetchUserEmailSubscriptions() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_USER_EMAIL_SUBSCRIPTION_REQUEST });
    return CourseAPI.userEmailSubscriptions
      .fetch()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_USER_EMAIL_SUBSCRIPTION_SUCCESS,
          allEmailSubscriptions: {
            settings: response.data.settings,
            pageFilter: response.data.subscription_page_filter,
          },
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_USER_EMAIL_SUBSCRIPTION_FAILURE });
      });
  };
}

export function updateUserEmailSubscriptions(
  value,
  pageFilter,
  successMessage,
  failureMessage,
) {
  const payload = { user_email_subscriptions: value, ...pageFilter };
  return (dispatch) => {
    dispatch({ type: actionTypes.USER_EMAIL_SUBSCRIPTION_UPDATE_REQUEST });
    return CourseAPI.userEmailSubscriptions
      .update(payload)
      .then((response) => {
        dispatch({
          type: actionTypes.USER_EMAIL_SUBSCRIPTION_UPDATE_SUCCESS,
          updatedEmailSubscriptions: {
            settings: response.data.settings,
            pageFilter: response.data.subscription_page_filter,
          },
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.USER_EMAIL_SUBSCRIPTION_UPDATE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
