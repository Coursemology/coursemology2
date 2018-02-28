import actions, { defaultPastAnswersDisplayed, defaultPastAnswersSelectable } from '../../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS: {
      if (action.payload.history) {
        return {
          ...state,
          ...action.payload.history.questions.reduce((obj, question) => {
            const pastAnswersLoaded = question.pastAnswers.length > 0;
            const { id, answerIds, numMoreRecentAnswers } = question;
            let { pastAnswerId } = action;
            let selected = [];
            pastAnswerId = parseInt(pastAnswerId, 10);
            if (pastAnswersLoaded) {
              if (answerIds.indexOf(pastAnswerId) >= 0) {
                selected = [pastAnswerId];
              } else {
                selected = answerIds.slice(0, defaultPastAnswersDisplayed);
              }
            }
            return {
              ...obj,
              [id]: {
                pastAnswersLoaded,
                selected,
                numMoreRecentAnswers,
                answerIds,
                isLoading: false,
                viewHistory: pastAnswersLoaded,
                labelIndex: 0,
              },
            };
          }, {}),
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
        const { answerIds } = question;
        let { labelIndex } = question;
        // Emsure that the id is not being repeatedly added
        if (answerIds.indexOf(latestAnswer.id) === -1) {
          answerIds.unshift(latestAnswer.id);
          labelIndex += 1;
        }
        // Allow selection of at most 10 answers
        if (answerIds.length > defaultPastAnswersSelectable) {
          answerIds.slice(0, defaultPastAnswersSelectable);
        }
        // Reset the selected answers to the first
        const selected = answerIds.slice(0, defaultPastAnswersDisplayed);
        return {
          ...state,
          [questionId]: {
            ...question,
            answerIds,
            selected,
            labelIndex,
          },
        };
      }
      return state;
    }
    case actions.TOGGLE_VIEW_HISTORY_MODE: {
      const { questionId, viewHistory } = action.payload;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          viewHistory,
        },
      };
    }
    default:
      return state;
  }
}
