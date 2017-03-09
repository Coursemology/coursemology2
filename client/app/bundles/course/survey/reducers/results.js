import actionTypes from '../constants';

const initialState = {
  survey: {},
  sections: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_SURVEY_RESULTS_SUCCESS: {
      return {
        survey: action.survey,
        sections: action.sections,
      };
    }
    default:
      return state;
  }
}
