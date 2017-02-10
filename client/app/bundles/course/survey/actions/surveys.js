import axios from 'lib/axios';
import { submit, change, SubmissionError } from 'redux-form';
import { browserHistory } from 'react-router';
import actionTypes, { formNames } from '../constants';
import { setNotification } from './index';

export function showSurveyForm(formParams) {
  return { type: actionTypes.SURVEY_FORM_SHOW, formParams };
}

export function hideSurveyForm() {
  return { type: actionTypes.SURVEY_FORM_HIDE };
}

export function submitSurveyForm() {
  return (dispatch) => {
    dispatch(submit(formNames.SURVEY));
  };
}

export function shiftEndDate(formName, newStartAt, oldValues, startAtField = 'start_at', endAtField = 'end_at') {
  return (dispatch) => {
    const { [startAtField]: oldStartAt, [endAtField]: oldEndAt } = oldValues;
    const oldStartTime = oldStartAt.getTime();
    const newStartTime = newStartAt.getTime();
    const oldEndTime = oldEndAt && oldEndAt.getTime();

    // if start time is before end time, allow user to clear the error
    if (oldEndAt && oldStartTime <= oldEndTime) {
      const newEndAt = new Date(oldEndTime + (newStartTime - oldStartTime));
      dispatch(change(formName, endAtField, newEndAt));
    }
  };
}

export function createSurvey(
  courseId,
  surveyFields,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_REQUEST });
    const surveysEndpoint = `/courses/${courseId}/surveys`;
    return axios.post(surveysEndpoint, surveyFields)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_SURVEY_SUCCESS,
          newSurveyData: response.data,
        });
        dispatch(hideSurveyForm());
        setNotification(successMessage)(dispatch);
        browserHistory.push(`${surveysEndpoint}/${response.data.id}`);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_SURVEY_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function fetchSurvey(courseId, surveyId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEY_REQUEST, id: surveyId });

    return axios.get(`/courses/${courseId}/surveys/${surveyId}`)
      .then((response) => {
        dispatch({
          id: surveyId,
          type: actionTypes.LOAD_SURVEY_SUCCESS,
          data: response.data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_SURVEY_FAILURE, id: surveyId });
      });
  };
}

export function fetchSurveys(courseId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEYS_REQUEST });

    return axios.get(`/courses/${courseId}/surveys/`)
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_SURVEYS_SUCCESS,
          data: response.data.surveys,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_SURVEYS_FAILURE });
      });
  };
}

export function updateSurvey(
  courseId,
  surveyId,
  surveyFields,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SURVEY_REQUEST, id: surveyId });

    return axios.patch(`/courses/${courseId}/surveys/${surveyId}`, surveyFields)
      .then((response) => {
        dispatch({
          id: surveyId,
          type: actionTypes.UPDATE_SURVEY_SUCCESS,
          data: response.data,
        });
        dispatch(hideSurveyForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_SURVEY_FAILURE, id: surveyId });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function deleteSurvey(courseId, surveyId, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SURVEY_REQUEST, id: surveyId });
    return axios.delete(`/courses/${courseId}/surveys/${surveyId}`)
      .then(() => {
        browserHistory.push(`/courses/${courseId}/surveys/`);
        dispatch({
          id: surveyId,
          type: actionTypes.DELETE_SURVEY_SUCCESS,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.DELETE_SURVEY_FAILURE, id: surveyId });
        setNotification(failureMessage)(dispatch);
      });
  };
}
