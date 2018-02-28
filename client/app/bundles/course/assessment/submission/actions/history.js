import CourseAPI from 'api/course';
import actionTypes from '../constants';
import translations from '../translations';

export function setNotification(message, errors) {
  return {
    type: actionTypes.SET_NOTIFICATION,
    message,
    errors,
  };
}

function buildErrorMessage(error) {
  if (!error || !error.response || !error.data) {
    return '';
  }

  if (typeof error.response.data.error === 'string') {
    return error.response.data.error;
  }

  return Object.values(error.response.data.errors).reduce(
    (flat, errors) => flat.concat(errors), []
  ).join(', ');
}

export function selectPastAnswers(questionId, answers) {
  const sortedAnswers = answers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const sortedAnswerIds = sortedAnswers.map(answer => answer.id);
  return (dispatch) => {
    dispatch({
      type: actionTypes.SELECT_PAST_ANSWERS,
      payload: { questionId, answerIds: sortedAnswerIds },
    });
  };
}

export function toggleViewHistoryMode(viewHistory, submissionQuestionId, questionId, answersLoaded) {
  return (dispatch) => {
    if (!answersLoaded) {
      dispatch({ type: actionTypes.GET_PAST_ANSWERS_REQUEST, payload: { questionId } });

      CourseAPI.assessment.submissionQuestions.getPastAnswers(submissionQuestionId)
        .then(response => response.data)
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
          dispatch({ type: actionTypes.GET_PAST_ANSWERS_FAILURE, payload: { questionId } });
          dispatch(setNotification(translations.getPastAnswersFailure, buildErrorMessage(error)));
        });
    } else {
      dispatch({
        type: actionTypes.TOGGLE_VIEW_HISTORY_MODE,
        payload: { viewHistory, questionId },
      });
    }
  };
}
