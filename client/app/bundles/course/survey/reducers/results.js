import actionTypes from '../constants';
import { sorts, sortResultsSectionElements } from '../utils';

const initialState = {
  isLoading: false,
  sections: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_SURVEY_RESULTS_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.LOAD_SURVEY_RESULTS_SUCCESS: {
      const anonymous = action.survey.anonymous;
      return {
        isLoading: false,
        sections: action.sections ?
          action.sections.map(sortResultsSectionElements(anonymous)).sort(sorts.byWeight) : [],
      };
    }
    case actionTypes.LOAD_SURVEY_RESULTS_FAILURE: {
      return { ...state, isLoading: false };
    }
    default:
      return state;
  }
}
