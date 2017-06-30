// eslint-disable-next-line import/no-unresolved, import/extensions, import/no-extraneous-dependencies
import axios from 'axios';
import CourseAPI from 'api/course';
import actionTypes from '../constants';

export function fetchSubmission(id) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions.edit(id)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.FETCH_SUBMISSION_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.FETCH_SUBMISSION_FAILURE }));
  };
}

export function saveDraft(submissionId, answers) {
  const payload = { submission: { answers } };
  return (dispatch) => {
    dispatch({ type: actionTypes.SAVE_DRAFT_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.SAVE_DRAFT_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.SAVE_DRAFT_FAILURE }));
  };
}

export function submit(submissionId, answers) {
  const payload = { submission: { answers, finalise: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.SUBMISSION_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.SUBMISSION_FAILURE }));
  };
}

export function unsubmit(submissionId) {
  const payload = { submission: { unsubmit: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UNSUBMIT_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UNSUBMIT_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.UNSUBMIT_FAILURE }));
  };
}

function getEvaluationResult(submissionId, answerId) {
  return (dispatch) => {
    CourseAPI.assessment.submissions.reloadAnswer(submissionId, { answer_id: answerId })
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.AUTOGRADE_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.AUTOGRADE_FAILURE }));
  };
}

function pollEvaluation(url, submissionId, answerId) {
  return (dispatch) => {
    const poller = setInterval(() => {
      axios.get(url, { params: { format: 'json' } })
        .then(response => response.data)
        .then((data) => {
          if (data.status === 'completed') {
            clearInterval(poller);
            dispatch(getEvaluationResult(submissionId, answerId));
          } else if (data.status === 'errored') {
            clearInterval(poller);
            dispatch({ type: actionTypes.AUTOGRADE_FAILURE });
          }
        })
        .catch(() => dispatch({ type: actionTypes.AUTOGRADE_FAILURE }));
    }, 500);
  };
}

export function autograde(submissionId, answers) {
  const payload = { submission: { answers, auto_grade: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.AUTOGRADE_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        if (data.redirect_url) {
          dispatch(pollEvaluation(data.redirect_url, submissionId, answers[0].id));
        } else {
          dispatch({
            type: actionTypes.AUTOGRADE_SUCCESS,
            payload: data,
          });
        }
      })
      .catch(() => dispatch({ type: actionTypes.AUTOGRADE_FAILURE }));
  };
}

export function saveGrade(submissionId, grades) {
  const payload = { submission: { answers: grades } };
  return (dispatch) => {
    dispatch({ type: actionTypes.SAVE_GRADE_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.SAVE_GRADE_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.SAVE_GRADE_FAILURE }));
  };
}

export function mark(submissionId, grades) {
  const payload = { submission: { answers: grades, mark: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.MARK_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.MARK_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.MARK_FAILURE }));
  };
}

export function publish(submissionId, grades) {
  const payload = { submission: { answers: grades, publish: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.PUBLISH_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.PUBLISH_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.PUBLISH_FAILURE }));
  };
}
