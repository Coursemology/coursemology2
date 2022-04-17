import actionTypes from '../constants';

const initialState = {
  minOverallLimit: 0,
  maxOverallLimit: 0,
  hardMinLearningRate: null,
  hardMaxLearningRate: null,
  assessmentGradeWeight: 0,
  assessmentSubmissionTimeWeight: 0,
  videoWatchPercentageWeight: 0,
  earliestOpenAt: null,
  latestEndAt: null,
  isFetching: false,
  isFetchError: false,
  learningRateRecords: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.FETCH_LEARNING_RATES_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case actionTypes.FETCH_LEARNING_RATES_SUCCESS:
      return {
        ...state,
        isFetching: false,
        learningRateRecords: action.learningRateRecords,
      };
    case actionTypes.FETCH_LEARNING_RATES_FAILURE:
      return {
        ...state,
        isFetching: false,
        isFetchError: true,
      };
    default:
      return state;
  }
}
