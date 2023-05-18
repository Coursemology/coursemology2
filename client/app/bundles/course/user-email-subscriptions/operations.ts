import { Operation } from 'store';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';

import actionTypes from './constants';

function loadUserEmailSubscriptions(data): Operation {
  return async (dispatch) => {
    dispatch({
      type: actionTypes.LOAD_USER_EMAIL_SUBSCRIPTION_SUCCESS,
      allEmailSubscriptions: {
        settings: data.settings,
        pageFilter: data.subscription_page_filter,
      },
    });
  };
}

export function fetchUserEmailSubscriptions(
  params?,
  onSuccess?,
  onError?,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.LOAD_USER_EMAIL_SUBSCRIPTION_REQUEST });
    return CourseAPI.userEmailSubscriptions
      .fetch(params)
      .then((response) => {
        onSuccess?.();
        dispatch(loadUserEmailSubscriptions(response.data));
      })
      .catch(() => {
        onError?.();
        dispatch({ type: actionTypes.LOAD_USER_EMAIL_SUBSCRIPTION_FAILURE });
      });
  };
}

export function updateUserEmailSubscriptions(
  value,
  pageFilter,
  successMessage,
  failureMessage,
): Operation {
  const payload = { user_email_subscriptions: value, ...pageFilter };
  return async (dispatch) => {
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
