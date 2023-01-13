import axios from 'axios';

import actionTypes from '../constants/programmingQuestionConstants';

const HEADER_TYPE = 'application/json';

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

function fetchImportResult(redirectEditUrl, successMessage, failureMessage) {
  return (dispatch) => {
    axios
      .get('', {
        headers: { Accept: HEADER_TYPE },
      })
      .then((response) => {
        const {
          import_result: { import_errored: importErrored },
        } = response.data;

        if (importErrored) {
          dispatch(submitFormEndEvaluating(response.data));
          dispatch(submitFormLoading(false));
          dispatch(setSubmissionMessage(failureMessage));
        } else {
          dispatch(setSubmissionMessage(successMessage));
          window.location = redirectEditUrl;
        }
      })
      .catch((error) => {
        dispatch(submitFormFailure(error));
        dispatch(submitFormLoading(false));
        dispatch(setSubmissionMessage(failureMessage));
      });
  };
}

function submitFormEvaluate(
  importJobUrl,
  redirectEditUrl,
  successMessage,
  failureMessage,
) {
  return (dispatch) => {
    const delay = 500;

    axios
      .get(importJobUrl, {
        headers: { Accept: HEADER_TYPE },
      })
      .then((response) => {
        const status = response.data.status;

        if (status === 'submitted') {
          dispatch(submitFormStartEvaluating());

          setTimeout(() => {
            dispatch(
              submitFormEvaluate(
                importJobUrl,
                redirectEditUrl,
                successMessage,
                failureMessage,
              ),
            );
          }, delay);
        } else {
          dispatch(
            fetchImportResult(redirectEditUrl, successMessage, failureMessage),
          );
        }
      })
      .catch((error) => {
        dispatch(submitFormFailure(error));
        dispatch(submitFormEndEvaluating());
        dispatch(submitFormLoading(false));
        dispatch(setSubmissionMessage(failureMessage));
      });
  };
}

export function submitForm(url, method, data, failureMessage) {
  return (dispatch) => {
    dispatch(submitFormLoading(true));

    axios({
      method,
      url,
      data,
      headers: { Accept: HEADER_TYPE },
    })
      .then((response) => {
        const {
          import_job_url: importJobUrl,
          redirect_edit_url: redirectEditUrl,
          redirect_assessment_url: redirectAssessmentUrl,
          message: successMessage,
        } = response.data;

        if (importJobUrl) {
          // Package is evaluating, poll for evaluation job using import_job_url
          dispatch(
            submitFormEvaluate(
              importJobUrl,
              redirectEditUrl,
              successMessage,
              failureMessage,
            ),
          );
        } else {
          dispatch(submitFormSuccess(response.data));
          dispatch(submitFormLoading(false));
          dispatch(setSubmissionMessage(successMessage));
          window.location = redirectAssessmentUrl;
        }
      })
      .catch((error) => {
        dispatch(submitFormFailure(error));
        dispatch(submitFormLoading(false));
        if (error.response) {
          // Server responded with errors.
          const {
            data: { message, errors },
          } = error.response;

          if (errors) {
            dispatch(
              setValidationErrors([{ path: ['save_errors'], error: errors }]),
            );
          } else {
            dispatch(setSubmissionMessage(message || failureMessage));
          }
        } else {
          // Not able to send request.
          dispatch(setSubmissionMessage(error.message));
        }
      });
  };
}
