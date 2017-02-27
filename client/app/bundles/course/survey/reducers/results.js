import actionTypes from '../constants';

const initialState = {
  survey: {},
  questions: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_SURVEY_RESULTS_SUCCESS: {
      return {
        survey: action.survey,
        questions: action.questions,
      };
    }
    default:
      return state;
  }
}
