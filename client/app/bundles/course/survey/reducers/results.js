import actionTypes from '../constants';
import { sorts, sortResultsSectionElements } from '../utils';

const initialState = {
  isLoading: false,
  survey: {},
  sections: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_SURVEY_RESULTS_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.LOAD_SURVEY_RESULTS_SUCCESS: {
      return {
        isLoading: false,
        survey: action.survey,
        sections: action.sections ?
          action.sections.map(sortResultsSectionElements).sort(sorts.byWeight) : [],
      };
    }
    case actionTypes.LOAD_SURVEY_RESULTS_FAILURE: {
      return { ...state, isLoading: false };
    }
    default:
      return state;
  }
}
