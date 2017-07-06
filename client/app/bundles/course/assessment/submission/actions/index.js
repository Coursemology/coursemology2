// eslint-disable-next-line import/no-unresolved, import/extensions, import/no-extraneous-dependencies
import axios from 'axios';
import CourseAPI from 'api/course';
import actionTypes from '../constants';

function pollJob(url, onSuccess, onFailure) {
  const poller = setInterval(() => {
    axios.get(url, { params: { format: 'json' } })
      .then(response => response.data)
      .then((data) => {
        if (data.status === 'completed') {
          clearInterval(poller);
          onSuccess();
        } else if (data.status === 'errored') {
          clearInterval(poller);
          onFailure();
        }
      })
      .catch(() => {
        clearInterval(poller);
        onFailure();
      });
  }, 500);
}

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

export function autogradeSubmission(id) {
  return (dispatch) => {
    dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions.autoGrade(id)
      .then(response => response.data)
      .then((data) => {
        pollJob(data.redirect_url,
          () => {
            dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_SUCCESS });
            fetchSubmission(id);
          },
          () => dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_FAILURE })
        );
      })
    .catch(() => dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_FAILURE }));
  };
}

export function saveDraft(submissionId, answers) {
  const payload = { submission: { answers } };
  return (dispatch) => {
    dispatch({ type: actionTypes.SAVE_DRAFT_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        if (data.redirect_url && data.format === 'html') {
          window.location = data.redirect_url;
        }
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
        if (data.redirect_url && data.format === 'html') {
          window.location = data.redirect_url;
        }
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

export function autogradeAnswer(submissionId, answers) {
  const payload = { submission: { answers, auto_grade: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.AUTOGRADE_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        if (data.redirect_url && data.format === 'html') {
          window.location = data.redirect_url;
        } else if (data.redirect_url) {
          pollJob(data.redirect_url,
            () => dispatch(getEvaluationResult(submissionId, answers[0].id)),
            () => dispatch({ type: actionTypes.AUTOGRADE_FAILURE })
          );
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

export function resetAnswer(submissionId, answerId) {
  const payload = { answer_id: answerId, reset_answer: true };
  return (dispatch) => {
    dispatch({ type: actionTypes.RESET_REQUEST });

    return CourseAPI.assessment.submissions.reloadAnswer(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.RESET_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.RESET_FAILURE }));
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

export function unmark(submissionId) {
  const payload = { submission: { unmark: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UNMARK_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UNMARK_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.UNMARK_FAILURE }));
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
