import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import CourseAPI from 'api/course';
import { getCourseId } from 'lib/helpers/url-helpers';
import actionTypes from '../constants';
import { setNotification } from './index';

export function createResponse(surveyId, navigate) {
  const courseId = getCourseId();
  const goToResponse = (responseId) =>
    navigate(
      `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`,
    );
  const goToResponseEdit = (responseId) =>
    navigate(
      `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}/edit`,
    );

  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_RESPONSE_REQUEST });

    return CourseAPI.survey.responses
      .create(surveyId)
      .then((response) => {
        goToResponseEdit(response.data.response.id);
        dispatch({
          type: actionTypes.CREATE_RESPONSE_SUCCESS,
          survey: response.data.survey,
          response: response.data.response,
        });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_RESPONSE_FAILURE });
        if (!error.response || !error.response.data) {
          return;
        }
        const data = error.response.data;
        if (error.response.status === 303) {
          (data.canModify || data.canSubmit ? goToResponseEdit : goToResponse)(
            data.responseId,
          );
        } else if (data.error) {
          setNotification(error.response.data.error)(dispatch);
        }
      });
  };
}

export function fetchResponse(responseId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_RESPONSE_REQUEST });

    return CourseAPI.survey.responses
      .fetch(responseId)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.LOAD_RESPONSE_SUCCESS,
          survey: data.survey,
          response: data.response,
          flags: data.flags,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_RESPONSE_FAILURE });
      });
  };
}

export function fetchEditableResponse(responseId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_RESPONSE_EDIT_REQUEST });

    return CourseAPI.survey.responses
      .edit(responseId)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.LOAD_RESPONSE_EDIT_SUCCESS,
          survey: data.survey,
          response: data.response,
          flags: data.flags,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_RESPONSE_EDIT_FAILURE });
      });
  };
}

export function updateResponse(
  responseId,
  payload,
  successMessage,
  failureMessage,
  navigate,
  setError,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_RESPONSE_REQUEST });

    return CourseAPI.survey.responses
      .update(responseId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UPDATE_RESPONSE_SUCCESS,
          survey: data.survey,
          response: data.response,
          flags: data.flags,
        });

        if (payload.response.submit && !data.flags.canModify) {
          const courseId = getCourseId();
          navigate(`/courses/${courseId}/surveys/`);
        }

        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_RESPONSE_FAILURE });
        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        dispatch(setNotification(failureMessage));
      });
  };
}

export function unsubmitResponse(responseId, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UNSUBMIT_RESPONSE_REQUEST });

    return CourseAPI.survey.responses
      .unsubmit(responseId)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UNSUBMIT_RESPONSE_SUCCESS,
          survey: data.survey,
          response: data.response,
          flags: data.flags,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.UNSUBMIT_RESPONSE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function fetchResponses() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_RESPONSES_REQUEST });

    return CourseAPI.survey.responses
      .index()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_RESPONSES_SUCCESS,
          responses: response.data.responses,
          survey: response.data.survey,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_RESPONSES_FAILURE });
      });
  };
}
