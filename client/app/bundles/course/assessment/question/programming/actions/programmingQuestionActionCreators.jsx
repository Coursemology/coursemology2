import axios from 'axios';
import actionTypes from '../constants/programmingQuestionConstants';

export function updateProgrammingQuestion(field, newValue) {
  return {
    type: actionTypes.PROGRAMMING_QUESTION_UPDATE,
    field,
    newValue,
  };
}

export function updateSkills(skills) {
  return {
    type: actionTypes.SKILLS_UPDATE,
    skills,
  };
}

export function updateEditorMode(mode) {
  return {
    type: actionTypes.EDITOR_MODE_UPDATE,
    mode,
  };
}

export function setValidationErrors(errors) {
  return {
    type: actionTypes.VALIDATION_ERRORS_SET,
    errors,
  };
}

export function clearHasError() {
  return {
    type: actionTypes.HAS_ERROR_CLEAR,
  };
}

export function clearSubmissionMessage() {
  return {
    type: actionTypes.SUBMISSION_MESSAGE_CLEAR,
  };
}

function setSubmissionMessage(message) {
  return {
    type: actionTypes.SUBMISSION_MESSAGE_SET,
    message,
  };
}

function submitFormLoading(isLoading) {
  return {
    type: actionTypes.SUBMIT_FORM_LOADING,
    isLoading,
  };
}

function submitFormStartEvaluating() {
  return {
    type: actionTypes.SUBMIT_FORM_EVALUATING,
    isEvaluating: true,
  };
}

function submitFormEndEvaluating(data) {
  return {
    type: actionTypes.SUBMIT_FORM_EVALUATING,
    isEvaluating: false,
    data,
  };
}

function submitFormSuccess(data) {
  return {
    type: actionTypes.SUBMIT_FORM_SUCCESS,
    data,
  };
}

function submitFormFailure(error) {
  return {
    type: actionTypes.SUBMIT_FORM_FAILURE,
    error,
  };
}

function fetchImportResult(successMessage, failureMessage) {
  return (dispatch) => {
    axios.get('', {
      headers: { Accept: 'application/json' },
    }).then((response) => {
      dispatch(submitFormEndEvaluating(response.data));
      dispatch(submitFormLoading(false));
      dispatch(setSubmissionMessage(successMessage));
    }).catch((error) => {
      dispatch(submitFormFailure(error));
      dispatch(submitFormLoading(false));
      dispatch(setSubmissionMessage(failureMessage));
    });
  };
}

function submitFormEvaluate(redirectUrl, successMessage, failureMessage) {
  return (dispatch) => {
    const delay = 500;

    axios.get(redirectUrl, {
      headers: { Accept: 'application/json' },
    }).then((response) => {
      const status = response.data.status;

      if (status === 'submitted') {
        dispatch(submitFormStartEvaluating());

        setTimeout(() => {
          dispatch(submitFormEvaluate(redirectUrl, successMessage, failureMessage));
        }, delay);
      } else {
        dispatch(fetchImportResult(successMessage, failureMessage));
      }
    }).catch((error) => {
      dispatch(submitFormFailure(error));
      dispatch(submitFormEndEvaluating());
      dispatch(submitFormLoading(false));
      dispatch(setSubmissionMessage(failureMessage));
    });
  };
}

export function submitForm(url, method, data, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch(submitFormLoading(true));

    axios({
      method,
      url,
      data,
      headers: { Accept: 'application/json' },
    }).then((response) => {
      if (response.data.redirect_url) {
        dispatch(submitFormEvaluate(response.data.redirect_url, successMessage, failureMessage));
      } else {
        dispatch(submitFormSuccess(response.data));
        dispatch(submitFormLoading(false));
        dispatch(setSubmissionMessage(successMessage));
      }
    }).catch((error) => {
      dispatch(submitFormFailure(error));
      dispatch(submitFormLoading(false));
      dispatch(setSubmissionMessage(failureMessage));
    });
  };
}
