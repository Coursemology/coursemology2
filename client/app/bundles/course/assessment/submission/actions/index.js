import GlobalAPI from 'api';
import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import pollJob from 'lib/helpers/jobHelpers';
import { redirectToNotFound } from 'lib/hooks/router/redirect';

import actionTypes, { workflowStates } from '../constants';
import {
  initiateAnswerFlagsForAnswers,
  resetExistingAnswerFlags,
} from '../reducers/answerFlags';
import { historyActions } from '../reducers/history';
import { initiateLiveFeedbackChatPerQuestion } from '../reducers/liveFeedbackChats';
import { previewAutogradingStarted } from '../reducers/previewAutograding';
import { scribingActions } from '../reducers/scribing';
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
        // Any rubric-graded answer (RBR, forum post, ...) carries a category breakdown; refresh its rubric
        // reference grade + categories so the moderation resets to the autograder's result.
        if (data.categoryGrades) {
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

export function fetchSubmission(id, onGetMonitoringSessionId, onError) {
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
        dispatch(scribingActions.initialize({ answers: data.answers }));
        dispatch(initiateAnswerFlagsForAnswers({ answers: data.answers }));
        dispatch(
          initiateLiveFeedbackChatPerQuestion({
            answerIds: data.answers.map((answer) => answer.id),
          }),
        );
      })
      .catch((error) => {
        dispatch({ type: actionTypes.FETCH_SUBMISSION_FAILURE });
        dispatch(resetExistingAnswerFlags());
        // Optional: lets a caller distinguish *why* the refetch failed. The marketplace preview
        // banner uses it to tell a purged sandbox (404) apart from an ordinary failure.
        onError?.(error);
      });
  };
}

// The submission page's own load, as opposed to a refetch from somewhere already on the page. A 404
// here means there is no such submission under this assessment — a typed, stale or guessed URL —
// and without this the page renders its normal shell with empty state, which reads as a broken page
// rather than a wrong address. `redirectToNotFound` rather than a not-found page rendered in place:
// this route sits inside the course shell, so rendering there would leave the sidebar and
// breadcrumbs around it, where the app's not-found page is standalone. The redirect carries the
// address, which that page restores, so the viewer still ends up looking at the URL they asked for.
//
// Deliberately a separate thunk rather than folding the 404 into `fetchSubmission`. The marketplace
// preview banner refetches through `fetchSubmission` and reads the very same 404 as a purged sandbox,
// for which it has its own message (`previewAutogradingSandboxGone`); redirecting on every 404
// centrally would navigate that banner away instead.
export function loadSubmissionPage(id, onGetMonitoringSessionId) {
  return (dispatch) =>
    dispatch(
      fetchSubmission(id, onGetMonitoringSessionId, (error) => {
        if (error?.response?.status === 404) redirectToNotFound();
      }),
    );
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
        // Marketplace preview sandbox only: the backend hands back the auto-grading job it just
        // enqueued, so PreviewAutogradingBanner can poll it and refresh the marks in place. The key
        // is absent everywhere else, which is what keeps this inert in real courses.
        if (data.submission?.autoGradingJobUrl) {
          dispatch(
            previewAutogradingStarted({
              jobUrl: data.submission.autoGradingJobUrl,
            }),
          );
        }
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

export function publish(submissionId, grades, exp, isPreview) {
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
        dispatch(
          setNotification(
            isPreview
              ? translations.previewPublishSuccess
              : translations.updateSuccess,
          ),
        );
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
