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

function fetchImportResult() {
  return (dispatch) => {
    axios.get('', {
      headers: { Accept: 'application/json' },
    }).then((response) => {
      dispatch(submitFormEndEvaluating(response.data));
      dispatch(submitFormLoading(false));
    })
      .catch((error) => {
        dispatch(submitFormFailure(error));
        dispatch(submitFormLoading(false));
      });
  };
}

function submitFormEvaluate(redirectUrl) {
  return (dispatch) => {
    const delay = 500;

    axios.get(redirectUrl, {
      headers: { Accept: 'application/json' },
    }).then((response) => {
      const status = response.data.status;

      if (status === 'submitted') {
        dispatch(submitFormStartEvaluating());

        setTimeout(() => {
          dispatch(submitFormEvaluate(redirectUrl));
        }, delay);
      } else {
        dispatch(fetchImportResult());
      }
    })
      .catch((error) => {
        dispatch(submitFormFailure(error));
        dispatch(submitFormLoading(false));
      });
  };
}

export function submitForm(url, method, data) {
  return (dispatch) => {
    dispatch(submitFormLoading(true));

    axios({
      method,
      url,
      data,
      headers: { Accept: 'application/json' },
    }).then((response) => {
      dispatch(submitFormSuccess(response.data));

      if (response.data.redirect_url) {
        dispatch(submitFormEvaluate(response.data.redirect_url));
      } else {
        dispatch(submitFormLoading(false));
      }
    }).catch((error) => {
      dispatch(submitFormFailure(error));
      dispatch(submitFormLoading(false));
    });
  };
}
