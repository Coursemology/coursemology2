import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { getCourseId } from 'lib/helpers/url-helpers';
import { SubmissionError } from 'redux-form';
import actionTypes from '../constants';

export function createCategory(
  { name, description },
  successMessage,
  failureMessage,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_CATEGORY_REQUEST });

    return CourseAPI.groups
      .createCategory({ name, description })
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_CATEGORY_SUCCESS,
        });
        setNotification(successMessage)(dispatch);
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${getCourseId()}/groups/${
              response.data.id
            }`;
          }
        }, 200);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.CREATE_CATEGORY_FAILURE,
        });
        setNotification(failureMessage)(dispatch);

        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function updateCategory(
  id,
  { name, description },
  successMessage,
  failureMessage,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_CATEGORY_REQUEST });

    return CourseAPI.groups
      .updateCategory(id, { name, description })
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_CATEGORY_SUCCESS,
          groupCategory: response.data,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.UPDATE_CATEGORY_FAILURE,
        });
        setNotification(failureMessage)(dispatch);

        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function deleteCategory(id, successMessage, failureMessage) {
  return (dispatch) =>
    CourseAPI.groups
      .deleteCategory(id)
      .then((response) => {
        setNotification(successMessage)(dispatch);
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${getCourseId()}/groups`;
          }
        }, 200);
      })
      .catch(() => {
        setNotification(failureMessage)(dispatch);
      });
}
