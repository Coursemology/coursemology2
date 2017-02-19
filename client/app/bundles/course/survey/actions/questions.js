import axios from 'lib/axios';
import { submit, arrayPush, SubmissionError } from 'redux-form';
import actionTypes, { formNames } from '../constants';
import { setNotification } from './index';

export function showQuestionForm(formParams) {
  return { type: actionTypes.QUESTION_FORM_SHOW, formParams };
}

export function hideQuestionForm() {
  return { type: actionTypes.QUESTION_FORM_HIDE };
}

export function submitQuestionForm() {
  return dispatch => dispatch(submit(formNames.SURVEY_QUESTION));
}

export function addToOptions(option) {
  return dispatch => dispatch(arrayPush(formNames.SURVEY_QUESTION, 'options', option));
}

export function addToOptionsToDelete(option) {
  return dispatch => dispatch(arrayPush(formNames.SURVEY_QUESTION, 'optionsToDelete', option));
}

export function createSurveyQuestion(
  courseId,
  surveyId,
  fields,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_QUESTION_REQUEST, surveyId });
    const endpoint = `/courses/${courseId}/surveys/${surveyId}/questions`;
    return axios.post(endpoint, fields)
      .then((response) => {
        dispatch({
          surveyId,
          type: actionTypes.CREATE_SURVEY_QUESTION_SUCCESS,
          question: response.data,
        });
        dispatch(hideQuestionForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_SURVEY_QUESTION_FAILURE, surveyId });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function updateSurveyQuestion(
  courseId,
  surveyId,
  questionId,
  data,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SURVEY_QUESTION_REQUEST, surveyId, questionId });

    return axios.patch(`/courses/${courseId}/surveys/${surveyId}/questions/${questionId}`, data)
      .then((response) => {
        dispatch({
          surveyId,
          questionId,
          type: actionTypes.UPDATE_SURVEY_QUESTION_SUCCESS,
          question: response.data,
        });
        dispatch(hideQuestionForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({
          surveyId,
          questionId,
          type: actionTypes.UPDATE_SURVEY_QUESTION_FAILURE,
        });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function deleteSurveyQuestion(
  courseId,
  surveyId,
  questionId,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SURVEY_QUESTION_REQUEST, surveyId, questionId });
    return axios.delete(`/courses/${courseId}/surveys/${surveyId}/questions/${questionId}`)
      .then(() => {
        dispatch({
          surveyId,
          questionId,
          type: actionTypes.DELETE_SURVEY_QUESTION_SUCCESS,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({
          surveyId,
          questionId,
          type: actionTypes.DELETE_SURVEY_QUESTION_FAILURE,
        });
        setNotification(failureMessage)(dispatch);
      });
  };
}
