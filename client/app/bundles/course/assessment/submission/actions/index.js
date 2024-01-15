import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import pollJob from 'lib/helpers/jobHelpers';

import actionTypes from '../constants';
import {
  initiateAnswerFlagsForAnswers,
  resetExistingAnswerFlags,
} from '../reducers/answerFlags';
import translations from '../translations';

import { buildErrorMessage, formatAnswers } from './utils';

const JOB_POLL_DELAY_MS = 500;
const JOB_STAGGER_DELAY_MS = 400;

export function getEvaluationResult(submissionId, answerId, questionId) {
  return (dispatch) => {
    CourseAPI.assessment.submissions
      .reloadAnswer(submissionId, { answer_id: answerId })
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.AUTOGRADE_SUCCESS,
          payload: data,
        });
      })
      .catch(() => {
        dispatch(setNotification(translations.requestFailure));
        dispatch({ type: actionTypes.AUTOGRADE_FAILURE, questionId });
      });
  };
}

export function fetchSubmission(id, onGetMonitoringSessionId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions
      .edit(id)
      .then((response) => response.data)
      .then((data) => {
        if (data.isSubmissionBlocked) {
          dispatch({ type: actionTypes.SUBMISSION_BLOCKED });
          return;
        }
        if (data.newSessionUrl) {
          window.location = data.newSessionUrl;
          return;
        }
        data.answers
          .filter((a) => a.autograding && a.autograding.path)
          .forEach((answer, index) => {
            setTimeout(() => {
              pollJob(
                answer.autograding.path,
                () =>
                  dispatch(
                    getEvaluationResult(
                      id,
                      answer.fields.id,
                      answer.questionId,
                    ),
                  ),
                () =>
                  dispatch({
                    type: actionTypes.AUTOGRADE_FAILURE,
                    questionId: answer.questionId,
                  }),
                JOB_POLL_DELAY_MS,
              );
            }, JOB_STAGGER_DELAY_MS * index);
          });
        if (data.monitoringSessionId !== undefined)
          onGetMonitoringSessionId?.(data.monitoringSessionId);
        dispatch({
          type: actionTypes.FETCH_SUBMISSION_SUCCESS,
          payload: data,
        });
        dispatch(initiateAnswerFlagsForAnswers({ answers: data.answers }));
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_SUBMISSION_FAILURE });
        dispatch(resetExistingAnswerFlags());
      });
  };
}

export function autogradeSubmission(id) {
  return (dispatch) => {
    dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions
      .autoGrade(id)
      .then((response) => response.data)
      .then((data) => {
        pollJob(
          data.jobUrl,
          () => {
            dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_SUCCESS });
            fetchSubmission(id)(dispatch);
            dispatch(setNotification(translations.autogradeSubmissionSuccess));
          },
          () => dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_FAILURE }),
          JOB_POLL_DELAY_MS,
        );
      })
      .catch(() =>
        dispatch({ type: actionTypes.AUTOGRADE_SUBMISSION_FAILURE }),
      );
  };
}

export function finalise(submissionId, rawAnswers) {
  const answers = formatAnswers(rawAnswers, Date.now());
  const payload = { submission: { answers, finalise: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.FINALISE_REQUEST });

    return CourseAPI.assessment.submissions
      .update(submissionId, payload)
      .then((response) => response.data)
      .then((data) => {
        if (data.newSessionUrl) {
          window.location = data.newSessionUrl;
        }
        dispatch({ type: actionTypes.FINALISE_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.FINALISE_FAILURE });
        dispatch(
          setNotification(translations.updateFailure, buildErrorMessage(error)),
        );
      });
  };
}

export function unsubmit(submissionId) {
  const payload = { submission: { unsubmit: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UNSUBMIT_REQUEST });

    return CourseAPI.assessment.submissions
      .update(submissionId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.UNSUBMIT_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UNSUBMIT_FAILURE });
        dispatch(
          setNotification(translations.updateFailure, buildErrorMessage(error)),
        );
      });
  };
}

export function mark(submissionId, grades, exp) {
  const payload = {
    submission: {
      answers: grades,
      draft_points_awarded: exp,
      mark: true,
    },
  };

  return (dispatch) => {
    dispatch({ type: actionTypes.MARK_REQUEST });

    return CourseAPI.assessment.submissions
      .update(submissionId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.MARK_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.MARK_FAILURE });
        dispatch(
          setNotification(translations.updateFailure, buildErrorMessage(error)),
        );
      });
  };
}

export function unmark(submissionId) {
  const payload = { submission: { unmark: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UNMARK_REQUEST });

    return CourseAPI.assessment.submissions
      .update(submissionId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.UNMARK_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UNMARK_FAILURE });
        dispatch(
          setNotification(translations.updateFailure, buildErrorMessage(error)),
        );
      });
  };
}

export function publish(submissionId, grades, exp) {
  const payload = {
    submission: {
      answers: grades,
      draft_points_awarded: exp,
      publish: true,
    },
  };
  return (dispatch) => {
    dispatch({ type: actionTypes.PUBLISH_REQUEST });

    return CourseAPI.assessment.submissions
      .update(submissionId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.PUBLISH_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.PUBLISH_FAILURE });
        dispatch(
          setNotification(
            translations.getPastAnswersFailure,
            buildErrorMessage(error),
          ),
        );
      });
  };
}

export function enterStudentView() {
  return (dispatch) => {
    dispatch({ type: actionTypes.ENTER_STUDENT_VIEW });
  };
}

export function exitStudentView() {
  return (dispatch) => {
    dispatch({ type: actionTypes.EXIT_STUDENT_VIEW });
  };
}

export function toggleViewHistoryMode(
  viewHistory,
  submissionQuestionId,
  questionId,
  answersLoaded,
) {
  return (dispatch) => {
    if (!answersLoaded) {
      dispatch({
        type: actionTypes.GET_PAST_ANSWERS_REQUEST,
        payload: { questionId },
      });

      CourseAPI.assessment.submissionQuestions
        .getPastAnswers(submissionQuestionId)
        .then((response) => response.data)
        .then((data) => {
          dispatch({
            type: actionTypes.GET_PAST_ANSWERS_SUCCESS,
            payload: { answers: data.answers, questionId },
          });
          dispatch({
            type: actionTypes.TOGGLE_VIEW_HISTORY_MODE,
            payload: { viewHistory, questionId },
          });
        })
        .catch((error) => {
          dispatch({
            type: actionTypes.GET_PAST_ANSWERS_FAILURE,
            payload: { questionId },
          });
          dispatch(
            setNotification(
              translations.getPastAnswersFailure,
              buildErrorMessage(error),
            ),
          );
        });
    } else {
      dispatch({
        type: actionTypes.TOGGLE_VIEW_HISTORY_MODE,
        payload: { viewHistory, questionId },
      });
    }
  };
}

export function purgeSubmissionStore() {
  return (dispatch) => {
    dispatch({ type: actionTypes.PURGE_SUBMISSION_STORE });
  };
}
