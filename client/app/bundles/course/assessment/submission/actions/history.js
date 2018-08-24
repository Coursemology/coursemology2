import actionTypes from '../constants';

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
