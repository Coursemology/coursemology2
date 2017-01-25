import actionTypes from '../constants';

const initialState = [];

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.CREATE_SURVEY_SUCCESS: {
      return [...state, action.newSurveyData];
    }
    case actionTypes.LOAD_SURVEY_SUCCESS: {
      const index = state.findIndex(survey => String(survey.id) === String(action.id));
      return index === -1 ? [...state, action.data] :
                            Object.assign([], state, { [index]: action.data });
    }
    default:
      return state;
  }
}
