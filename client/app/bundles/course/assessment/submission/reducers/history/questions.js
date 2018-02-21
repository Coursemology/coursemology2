import actions, { defaultPastAnswersDisplayed } from '../../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS: {
      if (action.payload.history) {
        return {
          ...state,
          ...action.payload.history.questions.reduce((obj, question) => ({
            ...obj,
            [question.id]: {
              pastAnswersLoaded: false,
              isLoading: false,
              answerIds: question.answerIds,
            },
          }), {}),
        };
      }
      return state;
    }
    case actions.SELECT_PAST_ANSWERS: {
      const { questionId, answerIds } = action.payload;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          selected: answerIds,
        },
      };
    }
    case actions.GET_PAST_ANSWERS_REQUEST: {
      const { questionId } = action.payload;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isLoading: true,
        },
      };
    }
    case actions.GET_PAST_ANSWERS_SUCCESS: {
      const { questionId, answers } = action.payload;
      const answerIds = answers.map(answer => answer.id);
      const selected = answerIds.slice(0, defaultPastAnswersDisplayed);
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          answerIds,
          selected,
          pastAnswersLoaded: true,
          isLoading: false,
        },
      };
    }
    case actions.GET_PAST_ANSWERS_FAILURE: {
      const { questionId } = action.payload;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          isLoading: false,
        },
      };
    }
    case actions.AUTOGRADE_SUCCESS: {
      const { questionId, latestAnswer } = action.payload;
      if (latestAnswer) {
        const question = state[questionId];
        const answerIds = question.answerIds;
        // Emsure that the id is not being repeatedly added
        if (answerIds.indexOf(latestAnswer.id) === -1) {
          answerIds.unshift(latestAnswer.id);
        }
        // Allow selection of at most 10 answers
        if (answerIds.length > 10) {
          answerIds.pop();
        }
        // Reset the selected answers to the first
        const selected = answerIds.slice(0, defaultPastAnswersDisplayed);
        return {
          ...state,
          [questionId]: {
            ...state[questionId],
            answerIds,
            selected,
          },
        };
      }
      return state;
    }
    default:
      return state;
  }
}
