import { browserHistory } from 'react-router';
import { SubmissionError } from 'redux-form';
import CourseAPI from 'api/course';
import { getCourseId } from 'lib/helpers/url-helpers';
import actionTypes from '../constants';
import { setNotification } from './index';

export function createResponse(surveyId) {
  const courseId = getCourseId();
  const goToResponse = responseId => browserHistory.push(
    `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`
  );
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_RESPONSE_REQUEST });

    return CourseAPI.survey.responses.create(surveyId)
      .then((response) => {
        goToResponse(response.data.response.id);
        dispatch({
          type: actionTypes.CREATE_RESPONSE_SUCCESS,
          survey: response.data.survey,
          response: response.data.response,
        });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_RESPONSE_FAILURE });
        if (!error.response || !error.response.data) { return; }
        if (error.response.data.responseId) {
          goToResponse(error.response.data.responseId);
        } else if (error.response.data.error) {
          setNotification(error.response.data.error)(dispatch);
        }
      });
  };
}

export function fetchResponse(responseId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_RESPONSE_REQUEST });

    return CourseAPI.survey.responses.fetch(responseId)
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_RESPONSE_SUCCESS,
          survey: response.data.survey,
          response: response.data.response,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_RESPONSE_FAILURE });
      });
  };
}

export function updateResponse(
  responseId,
  payload,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_RESPONSE_REQUEST });

    return CourseAPI.survey.responses.update(responseId, payload)
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_RESPONSE_SUCCESS,
          survey: response.data.survey,
          response: response.data.response,
        });

        if (payload.response.submit) {
          const courseId = getCourseId();
          browserHistory.push(`/courses/${courseId}/surveys/`);
        }

        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_RESPONSE_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}
