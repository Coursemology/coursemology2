import actionTypes from '../constants';

const initialState = [];

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.CREATE_SURVEY_SUCCESS: {
      return [...state, action.newSurveyData];
    }
    default:
      return state;
  }
}
