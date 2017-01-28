import actionTypes from '../constants';

const initialState = [];

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.CREATE_SURVEY_SUCCESS: {
      return [...state, action.newSurveyData];
    }
    case actionTypes.UPDATE_SURVEY_SUCCESS:
    case actionTypes.LOAD_SURVEY_SUCCESS: {
      const index = state.findIndex(survey => String(survey.id) === String(action.id));
      return index === -1 ? [...state, action.data] :
                            Object.assign([], state, { [index]: action.data });
    }
    case actionTypes.LOAD_SURVEYS_SUCCESS: {
      return action.data.surveys;
    }
    case actionTypes.DELETE_SURVEY_SUCCESS: {
      const index = state.findIndex(survey => String(survey.id) === String(action.id));
      return Object.assign([], state).splice(index, 1);
    }
    default:
      return state;
  }
}
