import axios from 'lib/axios';
import { browserHistory } from 'react-router';
import { SubmissionError } from 'redux-form';
import actionTypes from '../constants';
import { setNotification } from './index';

export function createResponse(courseId, surveyId) {
  const goToResponse = responseId => browserHistory.push(
    `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`
  );
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_RESPONSE_REQUEST });

    return axios.post(`/courses/${courseId}/surveys/${surveyId}/responses`)
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

export function fetchResponse(courseId, surveyId, responseId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_RESPONSE_REQUEST });

    return axios.get(`/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`)
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
  courseId,
  surveyId,
  responseId,
  payload,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_RESPONSE_REQUEST });

    return axios.patch(`/courses/${courseId}/surveys/${surveyId}/responses/${responseId}`, payload)
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_RESPONSE_SUCCESS,
          survey: response.data.survey,
          response: response.data.response,
        });

        if (payload.response.submit) {
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
