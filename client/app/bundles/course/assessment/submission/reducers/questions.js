import { combineReducers } from 'redux';
import actions from '../constants';
import arrayToObjectById from './utils';

function byId(state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
      return {
        ...state,
        ...arrayToObjectById(action.payload.questions),
      };
    case actions.AUTOGRADE_SUCCESS: {
      const questionId = action.payload.answers[0].questionId;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          answerId: action.payload.answers[0].id,
          explanationId: action.payload.explanations[0].id,
        },
      };
    }
    default:
      return state;
  }
}

function allIds(state = [], action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
      return [
        ...action.payload.questions.map(question => question.id),
      ];
    default:
      return state;
  }
}

export default combineReducers({
  byId,
  allIds,
});
