import { produce } from 'immer';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { SAVING_STATUS } from 'lib/constants/sharedConstants';
import pollJob from 'lib/helpers/jobHelpers';

import actionTypes from '../../constants';
import { updateAnswerFlagSavingStatus } from '../../reducers/answerFlags';
import { getClientVersionForAnswerId } from '../../selectors/answers';
import translations from '../../translations';
import { convertAnswerDataToInitialValue } from '../../utils/answers';
import { buildErrorMessage, formatAnswer } from '../utils';
import { fetchSubmission } from '..';

const JOB_POLL_DELAY_MS = 500;
export const STALE_ANSWER_ERR = 'stale_answer';

export const dispatchUpdateAnswerFlagSavingStatus =
  (answerId, savingStatus, isStaleAnswer = false) =>
  (dispatch) =>
    dispatch(
      updateAnswerFlagSavingStatus({
        answer: { id: answerId },
        savingStatus,
        isStaleAnswer,
      }),
    );

export const updateClientVersion = (answerId, clientVersion) => (dispatch) =>
  dispatch({
    type: actionTypes.UPDATE_ANSWER_CLIENT_VERSION,
    payload: { answer: { id: answerId, clientVersion } },
  });

export function submitAnswer(questionId, answerId, rawAnswer, resetField) {
  const currentTime = Date.now();
  const answer = formatAnswer(rawAnswer, currentTime);
  const payload = { answer };

  return (dispatch) => {
    dispatch(updateClientVersion(answerId, currentTime));
    dispatch({
      type: actionTypes.AUTOGRADE_REQUEST,
      payload: { questionId },
    });
    dispatch(
      dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saving),
    );

    return CourseAPI.assessment.answer.answer
      .submitAnswer(answerId, payload)
      .then((response) => response.data)
      .then((data) => {
        if (data.newSessionUrl) {
          window.location = data.newSessionUrl;
        } else if (data.jobUrl) {
          dispatch({
            type: actionTypes.AUTOGRADE_SUBMITTED,
            payload: { questionId, jobUrl: data.jobUrl },
          });
        } else {
          dispatch({
            type: actionTypes.AUTOGRADE_SUCCESS,
            payload: { ...data, answerId },
          });
          // When an answer is submitted, the value of that field needs to be updated.
          resetField(`${answerId}`, {
            defaultValue: convertAnswerDataToInitialValue(data),
          });
        }
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saved),
        );
      })
      .catch(() => {
        dispatch({ type: actionTypes.AUTOGRADE_FAILURE, questionId });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Failed),
        );
        dispatch(setNotification(translations.requestFailure));
      });
  };
}

export function saveAnswer(answerData, answerId, currentTime, resetField) {
  const answer = formatAnswer(answerData, currentTime);
  const payload = { answer };

  return (dispatch, getState) => {
    // When the current client version is greater than that in the redux store,
    // the answer is already stale and no API call is needed.
    const isAnswerStale =
      getClientVersionForAnswerId(getState(), answerId) > currentTime;
    if (isAnswerStale) return {};

    dispatch({
      type: actionTypes.SAVE_ANSWER_REQUEST,
      payload: { answer: { id: answerId, clientVersion: currentTime } },
    });
    dispatch(
      dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saving),
    );

    return CourseAPI.assessment.answer.answer
      .saveDraft(answerId, payload)
      .then((response) => {
        const data = response.data;
        if (data.newSessionUrl) {
          window.location = data.newSessionUrl;
        }
        const updatedAnswer = data;
        dispatch({
          type: actionTypes.SAVE_ANSWER_SUCCESS,
          payload: {
            ...updatedAnswer,
            handleUpdateInitialValue: () => {
              resetField(`${answerId}`, {
                defaultValue: convertAnswerDataToInitialValue(updatedAnswer),
              });
            },
          },
        });

        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saved),
        );
      })
      .catch((e) => {
        dispatch({
          type: actionTypes.SAVE_ANSWER_FAILURE,
          payload: { answerId },
        });
        const isStaleAnswer = buildErrorMessage(e).includes(STALE_ANSWER_ERR);
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(
            answerId,
            SAVING_STATUS.Failed,
            isStaleAnswer,
          ),
        );
      });
  };
}

export function saveAllAnswers(rawAnswers, resetField) {
  const currentTime = Date.now();

  // const payload = { submission: { answers, is_save_draft: true } };
  return (dispatch) => {
    Object.values(rawAnswers).forEach((rawAnswer) =>
      dispatch(saveAnswer(rawAnswer, rawAnswer.id, currentTime, resetField)),
    );
  };
}

const pollFeedbackJob =
  (jobUrl, submissionId, questionId, answerId) => (dispatch) => {
    pollJob(
      jobUrl,
      () => {
        dispatch({ type: actionTypes.FEEDBACK_SUCCESS, questionId });
        fetchSubmission(submissionId)(dispatch);
      },
      () => {
        dispatch({
          type: actionTypes.FEEDBACK_FAILURE,
          questionId,
          answerId,
        });
        dispatch(setNotification(translations.generateFeedbackFailure));
      },
      JOB_POLL_DELAY_MS,
    );
  };

export function generateFeedback(submissionId, answerId, questionId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FEEDBACK_REQUEST, questionId, answerId });

    return CourseAPI.assessment.submissions
      .generateFeedback(submissionId, { answer_id: answerId })
      .then((response) => {
        pollFeedbackJob(
          response.data.jobUrl,
          submissionId,
          questionId,
          answerId,
        )(dispatch);
      })
      .catch(() => {
        dispatch({
          type: actionTypes.FEEDBACK_FAILURE,
          questionId,
          answerId,
        });
        dispatch(setNotification(translations.requestFailure));
      });
  };
}

// Immediately disable "Get Help" button to prevent user prematurely retrying.
export function initializeLiveFeedback(questionId) {
  return (dispatch) =>
    dispatch({
      type: actionTypes.LIVE_FEEDBACK_INITIAL,
      payload: {
        questionId,
      },
    });
}

// if status returned 200, populate feedback array if has feedback, otherwise return error
const handleFeedbackOKResponse = ({
  dispatch,
  response,
  answerId,
  questionId,
  successMessage,
  noFeedbackMessage,
}) => {
  const feedbackFiles = response.data?.data?.feedbackFiles ?? [];
  const success = response.data?.success;
  if (success && feedbackFiles.length) {
    dispatch({
      type: actionTypes.LIVE_FEEDBACK_SUCCESS,
      payload: {
        questionId,
        answerId,
        feedbackFiles,
      },
    });
    dispatch(setNotification(successMessage));
  } else {
    dispatch({
      type: actionTypes.LIVE_FEEDBACK_FAILURE,
      payload: {
        questionId,
      },
    });
    dispatch(setNotification(noFeedbackMessage));
  }
};

export function generateUserRequest(questionId, answerId, message) {
  return {
    type: actionTypes.LIVE_FEEDBACK_USER_REQUEST,
    payload: {
      questionId,
      answerId,
      userRequest: message,
    },
  };
}

export function generateLiveFeedback({
  submissionId,
  answerId,
  questionId,
  successMessage,
  noFeedbackMessage,
}) {
  return (dispatch) =>
    CourseAPI.assessment.submissions
      .generateLiveFeedback(submissionId, { answer_id: answerId })
      .then((response) => {
        if (response.status === 200) {
          handleFeedbackOKResponse({
            dispatch,
            response,
            answerId,
            questionId,
            successMessage,
            noFeedbackMessage,
          });
        } else {
          // 201, save feedback signed token
          dispatch({
            type: actionTypes.LIVE_FEEDBACK_REQUEST,
            payload: {
              questionId,
              liveFeedbackId: response.data?.liveFeedbackId,
              feedbackUrl: response.data?.feedbackUrl,
              token: response.data?.data?.token,
            },
          });
        }
      })
      .catch(() => {
        dispatch({
          type: actionTypes.LIVE_FEEDBACK_FAILURE,
          payload: {
            questionId,
          },
        });
        dispatch(setNotification(translations.requestFailure));
      });
}

export function fetchLiveFeedback({
  answerId,
  questionId,
  feedbackUrl,
  liveFeedbackId,
  feedbackToken,
  successMessage,
  noFeedbackMessage,
}) {
  return (dispatch) =>
    CourseAPI.assessment.submissions
      .fetchLiveFeedback(feedbackUrl, feedbackToken)
      .then((response) => {
        if (response.status === 200) {
          CourseAPI.assessment.submissions.saveLiveFeedback(
            liveFeedbackId,
            response.data?.data?.feedbackFiles ?? [],
          );
          handleFeedbackOKResponse({
            dispatch,
            response,
            answerId,
            questionId,
            successMessage,
            noFeedbackMessage,
          });
        }
      })
      .catch(() => {
        dispatch({
          type: actionTypes.LIVE_FEEDBACK_FAILURE,
          payload: {
            questionId,
          },
        });
        dispatch(setNotification(translations.requestFailure));
      });
}

export function reevaluateAnswer(submissionId, answerId, questionId) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.REEVALUATE_REQUEST,
      payload: { questionId },
    });

    return CourseAPI.assessment.submissions
      .reevaluateAnswer(submissionId, { answer_id: answerId })
      .then((response) => response.data)
      .then((data) => {
        if (data.newSessionUrl) {
          window.location = data.newSessionUrl;
        } else if (data.jobUrl) {
          dispatch({
            type: actionTypes.REEVALUATE_SUBMITTED,
            payload: { questionId, jobUrl: data.jobUrl },
          });
        } else {
          dispatch({
            type: actionTypes.REEVALUATE_SUCCESS,
            payload: { ...data, questionId },
          });
        }
      })
      .catch(() => {
        dispatch({ type: actionTypes.REEVALUATE_FAILURE, questionId });
        dispatch(setNotification(translations.requestFailure));
      });
  };
}

export function resetAnswer(submissionId, answerId, questionId, resetField) {
  const currentTime = Date.now();
  const payload = { answer_id: answerId, reset_answer: true };
  return (dispatch) => {
    dispatch(updateClientVersion(answerId, currentTime));
    dispatch({ type: actionTypes.RESET_REQUEST, questionId });

    return CourseAPI.assessment.submissions
      .reloadAnswer(submissionId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.RESET_SUCCESS,
          payload: data,
          questionId,
        });

        // When an answer is submitted, the value of that field needs to be updated.
        resetField(`${answerId}`, {
          defaultValue: convertAnswerDataToInitialValue(data),
        });
      })
      .catch(() => dispatch({ type: actionTypes.RESET_FAILURE, questionId }));
  };
}

export function saveAllGrades(submissionId, grades, exp, published) {
  const expParam = published ? 'points_awarded' : 'draft_points_awarded';
  const modifiedGrades = grades.map((grade) => ({
    id: grade.id,
    grade: grade.grade,
  }));
  const payload = {
    submission: {
      answers: modifiedGrades,
      [expParam]: exp,
    },
  };

  return (dispatch) => {
    dispatch({ type: actionTypes.SAVE_ALL_GRADE_REQUEST });

    return CourseAPI.assessment.submissions
      .updateGrade(submissionId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({ type: actionTypes.SAVE_ALL_GRADE_SUCCESS, payload: data });
        dispatch(setNotification(translations.updateSuccess));
      })
      .catch((error) => {
        dispatch({ type: actionTypes.SAVE_ALL_GRADE_FAILURE });
        dispatch(
          setNotification(translations.updateFailure, buildErrorMessage(error)),
        );
      });
  };
}

export function saveGrade(submissionId, grade, questionId, exp, published) {
  const expParam = published ? 'points_awarded' : 'draft_points_awarded';
  const modifiedGrade = { id: grade.id, grade: grade.grade };
  const payload = {
    submission: {
      answers: [modifiedGrade],
      [expParam]: exp,
    },
  };

  return (dispatch) => {
    dispatch({ type: actionTypes.SAVE_GRADE_REQUEST });

    return CourseAPI.assessment.submissions
      .updateGrade(submissionId, payload)
      .then((response) => response.data)
      .then((data) => {
        const updatedGrade = produce(data, (draftData) => {
          const tempDraftData = draftData;
          tempDraftData.answers = tempDraftData.answers.filter(
            (answer) => answer.questionId === questionId,
          );
        });

        dispatch({
          type: actionTypes.SAVE_GRADE_SUCCESS,
          payload: updatedGrade,
        });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.SAVE_GRADE_FAILURE });
        dispatch(
          setNotification(translations.updateFailure, buildErrorMessage(error)),
        );
      });
  };
}

export function updateGrade(id, grade, bonusAwarded) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.UPDATE_GRADING,
      id,
      grade,
      bonusAwarded,
    });
  };
}
