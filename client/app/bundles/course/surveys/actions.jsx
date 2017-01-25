import axios from 'lib/axios';
import { submit, change, SubmissionError } from 'redux-form';
import actionTypes from './constants';

export function showSurveyForm(formParams) {
  return { type: actionTypes.SURVEY_FORM_SHOW, formParams };
}

export function hideSurveyForm() {
  return { type: actionTypes.SURVEY_FORM_HIDE };
}

export function submitSurveyForm() {
  return (dispatch) => {
    dispatch(submit('survey'));
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

export function setNotification(message) {
  const duration = 1500;

  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_SURVEY_NOTIFICATION,
      message,
    });
    setTimeout(() => {
      dispatch({ type: actionTypes.RESET_SURVEY_NOTIFICATION });
    }, duration);
  };
}

export function createSurvey(
  endpoint,
  surveyFields,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_REQUEST });

    return axios.post(endpoint, surveyFields)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_SURVEY_SUCCESS,
          newSurveyData: response.data,
        });
        dispatch(hideSurveyForm());
        setNotification(successMessage)(dispatch);
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
