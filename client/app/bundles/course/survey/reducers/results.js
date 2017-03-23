import actionTypes from '../constants';
import { sorts, sortResultsSectionElements } from '../utils';

const initialState = {
  survey: {},
  sections: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_SURVEY_RESULTS_SUCCESS: {
      return {
        survey: action.survey,
        sections: action.sections ?
          action.sections.map(sortResultsSectionElements).sort(sorts.byWeight) : [],
      };
    }
    default:
      return state;
  }
}
