import actions from '../constants';
import arrayToObjectById from './utils';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
      return {
        ...state,
        ...arrayToObjectById(action.payload.explanations),
      };
    case actions.AUTOGRADE_SUCCESS:
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
