import actions from '../constants';
import arrayToObjectById from './utils';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.UPDATE_SUBMISSION_SUCCESS:
      return {
        ...state,
        ...arrayToObjectById(action.payload.explanations),
      };
    case actions.UPDATE_ANSWER_SUCCESS:
      return action.payload.explanations[0] ? {
        ...arrayToObjectById(
          Object.values(state).filter(explanation => (
            explanation.questionId !== action.payload.explanations[0].questionId
          )).concat(action.payload.explanations)
        ),
      } : state;
    default:
      return state;
  }
}
