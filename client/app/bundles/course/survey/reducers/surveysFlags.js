import actionTypes from '../constants';

const initialState = {
  canCreate: false,
  isQuestionMoved: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_SURVEYS_SUCCESS: {
      return { ...state, canCreate: action.canCreate };
    }
    case actionTypes.REORDER_QUESTION:
    case actionTypes.CHANGE_QUESTION_SECTION: {
      return { ...state, isQuestionMoved: true };
    }
    case actionTypes.UPDATE_QUESTION_ORDER_SUCCESS: {
      return { ...state, isQuestionMoved: false };
    }
    default:
      return state;
  }
}
