import axios from 'lib/axios';
import { submit, SubmissionError } from 'redux-form';
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
          data: response.data,
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
