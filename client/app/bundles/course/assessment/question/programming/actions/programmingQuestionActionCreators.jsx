import axios from 'axios';
import { actionTypes } from '../constants';

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

function fetchImportResult(redirectAssessment, successMessage, failureMessage) {
  return (dispatch) => {
    axios.get('', {
      headers: { Accept: 'application/json' },
    }).then((response) => {
      const { import_result: { import_errored: importErrored } } = response.data;

      dispatch(setSubmissionMessage(successMessage));

      if (importErrored) {
        dispatch(submitFormEndEvaluating(response.data));
        dispatch(submitFormLoading(false));
      } else {
        window.location = redirectAssessment;
      }
    }).catch((error) => {
      dispatch(submitFormFailure(error));
      dispatch(submitFormLoading(false));
      dispatch(setSubmissionMessage(failureMessage));
    });
  };
}

function submitFormEvaluate(importJobUrl, redirectEdit, redirectAssessment, successMessage,
  failureMessage) {
  return (dispatch) => {
    const delay = 500;

    axios.get(importJobUrl, {
      headers: { Accept: 'application/json' },
    }).then((response) => {
      const status = response.data.status;

      if (status === 'submitted') {
        dispatch(submitFormStartEvaluating());

        setTimeout(() => {
          dispatch(submitFormEvaluate(importJobUrl, redirectEdit, redirectAssessment,
            successMessage, failureMessage));
        }, delay);
      } else {
        if (redirectEdit) {
          // Redirect to edit page without refreshing
          window.history.pushState(null, null, redirectEdit.url);
          document.title = redirectEdit.page_title;

          $('.page-header > h1 > span:first').text(redirectEdit.page_header);
          $('.breadcrumb .active').text(redirectEdit.page_header);

          // Reload when the user tries to return the the new programming question page
          window.onpopstate = function (event) {
            if (event && event.state === null) {
              window.location.href = window.location.href;
            }
          };
        }

        dispatch(fetchImportResult(redirectAssessment, successMessage, failureMessage));
      }
    }).catch((error) => {
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
      headers: { Accept: 'application/json' },
    }).then((response) => {
      const {
        import_job_url: importJobUrl,
        redirect_edit: redirectEdit,
        redirect_assessment: redirectAssessment,
        message: successMessage,
      } = response.data;

      if (importJobUrl) {
        // Package is evaluating, poll for evaluation job using import_job_url
        dispatch(submitFormEvaluate(importJobUrl, redirectEdit, redirectAssessment,
          successMessage, failureMessage));
      } else if (redirectAssessment) {
        // No need for package evaluation, redirect back to assessment page
        window.location = redirectAssessment;
      } else {
        dispatch(submitFormSuccess(response.data));
        dispatch(submitFormLoading(false));
        dispatch(setSubmissionMessage(successMessage));
      }
    }).catch((error) => {
      dispatch(submitFormFailure(error));
      dispatch(submitFormLoading(false));
      if (error.response) {
        // Server responded with errors.
        const { data: { message, errors } } = error.response;

        if (errors) {
          dispatch(setValidationErrors([{ path: ['save_errors'], error: errors }]));
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
