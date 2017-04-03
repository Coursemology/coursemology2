import actionTypes from '../constants';

const initialState = {
  isLoadingSurvey: false,
  isLoadingSurveys: false,
  canCreate: false,
  isQuestionMoved: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_SURVEY_REQUEST: {
      return { ...state, isLoadingSurvey: true };
    }
    case actionTypes.LOAD_SURVEY_FAILURE:
    case actionTypes.LOAD_SURVEY_SUCCESS: {
      return { ...state, isLoadingSurvey: false };
    }
    case actionTypes.LOAD_SURVEYS_REQUEST: {
      return { ...state, isLoadingSurveys: true };
    }
    case actionTypes.LOAD_SURVEYS_SUCCESS: {
      return { ...state, isLoadingSurveys: false, canCreate: action.canCreate };
    }
    case actionTypes.LOAD_SURVEYS_FAILURE: {
      return { ...state, isLoadingSurveys: false };
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
