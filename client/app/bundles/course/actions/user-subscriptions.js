/* eslint-disable import/prefer-default-export */
import CourseAPI from 'api/course';
import actionTypes from '../constants';
import { setNotification } from './index';

export function fetchUserSubscriptions() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_USER_SUBSCRIPTION_REQUEST });
    return CourseAPI.userSubscriptions
      .fetch()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_USER_SUBSCRIPTION_SUCCESS,
          allSubscriptions: {
            settings: response.data.settings,
            pageFilter: response.data.subscription_page_filter,
          },
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_USER_SUBSCRIPTION_FAILURE });
      });
  };
}

export function updateUserSubscriptions(
  value,
  pageFilter,
  successMessage,
  failureMessage,
) {
  const payload = { user_subscriptions: value, ...pageFilter };
  return (dispatch) => {
    dispatch({ type: actionTypes.USER_SUBSCRIPTION_UPDATE_REQUEST });
    return CourseAPI.userSubscriptions
      .update(payload)
      .then((response) => {
        dispatch({
          type: actionTypes.USER_SUBSCRIPTION_UPDATE_SUCCESS,
          updatedSubscriptions: {
            settings: response.data.settings,
            pageFilter: response.data.subscription_page_filter,
          },
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.USER_SUBSCRIPTION_UPDATE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
