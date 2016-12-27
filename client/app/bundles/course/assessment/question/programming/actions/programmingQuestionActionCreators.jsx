import actionTypes from '../constants/programmingQuestionConstants';

import 'whatwg-fetch';

export function updateProgrammingQuestion(field, newValue) {
  return {
    type: actionTypes.PROGRAMMING_QUESTION_UPDATE,
    field: field,
    newValue: newValue
  };
}

export function updateSkills(skills) {
  return {
    type: actionTypes.SKILLS_UPDATE,
    skills: skills
  }
}

export function updateEditorMode(mode) {
  return {
    type: actionTypes.EDITOR_MODE_UPDATE,
    mode: mode
  }
}

export function submitForm(url, method, data) {
  return (dispatch) => {
    dispatch(submitFormLoading(true));

    fetch(url, {
      method: method,
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json'
      },
      body: data
    }).then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return response.json();
    }).then((json) => {
      dispatch(submitFormSuccess(json));

      if (json.redirect_url) {
        dispatch(submitFormEvaluate(json.redirect_url));
      } else {
        dispatch(submitFormLoading(false))
      }
    }).catch((error) => {
      dispatch(submitFormFailure(error));
      dispatch(submitFormLoading(false));
    })
  }
}

function submitFormLoading(isLoading) {
  return {
    type: actionTypes.SUBMIT_FORM_LOADING,
    isLoading: isLoading
  }
}

function submitFormStartEvaluating() {
  return {
    type: actionTypes.SUBMIT_FORM_EVALUATING,
    isEvaluating: true
  }
}

function submitFormEndEvaluating(data) {
  return {
    type: actionTypes.SUBMIT_FORM_EVALUATING,
    isEvaluating: false,
    data: data
  }
}

function submitFormSuccess(data) {
  return {
    type: actionTypes.SUBMIT_FORM_SUCCESS,
    data: data
  }
}

function submitFormFailure(error) {
  return {
    type: actionTypes.SUBMIT_FORM_FAILURE,
    error: error
  }
}

function fetchImportResult() {
  return (dispatch) => {
    fetch('', {
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json'
      },
    }).then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return response.json();
    }).then((json) => {
      dispatch(submitFormEndEvaluating(json));
      dispatch(submitFormLoading(false));
    }).catch((error) => {
      dispatch(submitFormFailure(error));
      dispatch(submitFormLoading(false));
    })
  }
}

function submitFormEvaluate(redirect_url) {
  return (dispatch) => {
    const delay = 500;

    fetch(redirect_url, {
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json'
      },
    }).then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }

      return response.json();
    }).then((json) => {
      const status = json.status;

      if (status == 'submitted') {
        dispatch(submitFormStartEvaluating());

        setTimeout(() => {
          dispatch(submitFormEvaluate(redirect_url));
        }, delay)
      } else {
        dispatch(fetchImportResult());
      }
    }).catch((error) => {
      dispatch(submitFormFailure(error));
      dispatch(submitFormLoading(false));
    })
  }
}
