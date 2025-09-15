import { QuestionType } from 'types/course/assessment/question';

import GlobalAPI from 'api';
import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import pollJob from 'lib/helpers/jobHelpers';

import actionTypes, { workflowStates } from '../constants';
import {
  initiateAnswerFlagsForAnswers,
  resetExistingAnswerFlags,
} from '../reducers/answerFlags';
import { historyActions } from '../reducers/history';
import { initiateLiveFeedbackChatPerQuestion } from '../reducers/liveFeedbackChats';
import translations from '../translations';

import { buildErrorMessage, formatAnswers } from './utils';

const JOB_POLL_DELAY_MS = 500;

export function getEvaluationResult(submissionId, answerId, questionId) {
  return (dispatch) => {
    CourseAPI.assessment.submissions
      .reloadAnswer(submissionId, { answer_id: answerId })
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.AUTOGRADE_SUCCESS,
          payload: { ...data, answerId },
        });
        if (data.questionType === QuestionType.RubricBasedResponse) {
          dispatch({
            type: actionTypes.AUTOGRADE_RUBRIC_SUCCESS,
            payload: {
              id: answerId,
              questionId,
              grading: data.grading,
              categoryGrades: data.categoryGrades,
              aiGeneratedComment: data.aiGeneratedComment,
            },
          });
        }
        dispatch(
          historyActions.pushSingleAnswerItem({
            questionId,
            submissionId,
            answerItem: {
              id: data.latestAnswer?.id ?? data.id,
              createdAt: data.latestAnswer?.createdAt ?? data.createdAt,
              currentAnswer: false,
              workflowState: workflowStates.Graded,
            },
          }),
        );
      })
      .catch(() => {
        dispatch(setNotification(translations.requestFailure));
        dispatch({ type: actionTypes.AUTOGRADE_FAILURE, questionId, answerId });
      });
  };
}

export function getJobStatus(jobUrl) {
  return GlobalAPI.jobs.get(jobUrl);
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
        if (data.monitoringSessionId !== undefined)
          onGetMonitoringSessionId?.(data.monitoringSessionId);
        dispatch({
          type: actionTypes.FETCH_SUBMISSION_SUCCESS,
          payload: data,
        });
        dispatch(
          historyActions.initSubmissionHistory({
            submissionId: data.submission.id,
            questionHistories: data.history.questions,
            questions: data.questions,
          }),
        );
        dispatch(initiateAnswerFlagsForAnswers({ answers: data.answers }));
        dispatch(
          initiateLiveFeedbackChatPerQuestion({
            answerIds: data.answers.map((answer) => answer.id),
          }),
        );
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
        dispatch(initiateAnswerFlagsForAnswers({ answers: data.answers }));
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

export function purgeSubmissionStore() {
  return (dispatch) => {
    dispatch({ type: actionTypes.PURGE_SUBMISSION_STORE });
  };
}
