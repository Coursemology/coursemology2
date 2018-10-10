import CourseAPI from 'api/course';
import { actionTypes } from '../constants';

function submitFormRequest() {
  return {
    type: actionTypes.SUBMIT_FORM_REQUEST,
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

export default function submitForm(data) {
  return (dispatch) => {
    dispatch(submitFormRequest());

    // axios({
    //   method,
    //   url,
    //   data,
    //   headers: { Accept: 'application/json' },
    // }).then((response) => {
    //   const {
    //     import_job_url: importJobUrl,
    //     redirect_edit: redirectEdit,
    //     redirect_assessment: redirectAssessment,
    //     message: successMessage,
    //   } = response.data;
    //
    //   if (importJobUrl) {
    //     // Package is evaluating, poll for evaluation job using import_job_url
    //     dispatch(submitFormEvaluate(importJobUrl, redirectEdit, redirectAssessment,
    //       successMessage, failureMessage));
    //   } else if (redirectAssessment) {
    //     // No need for package evaluation, redirect back to assessment page
    //     window.location = redirectAssessment;
    //   } else {
    //     dispatch(submitFormSuccess(response.data));
    //     dispatch(submitFormLoading(false));
    //     dispatch(setSubmissionMessage(successMessage));
    //   }
    // }).catch((error) => {
    //   dispatch(submitFormFailure(error));
    //   dispatch(submitFormLoading(false));
    //   if (error.response) {
    //     // Server responded with errors.
    //     const { data: { message, errors } } = error.response;
    //
    //     if (errors) {
    //       dispatch(setValidationErrors([{ path: ['save_errors'], error: errors }]));
    //     } else {
    //       dispatch(setSubmissionMessage(message || failureMessage));
    //     }
    //   } else {
    //     // Not able to send request.
    //     dispatch(setSubmissionMessage(error.message));
    //   }
    // });
  };
}
