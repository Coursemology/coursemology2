import actionTypes from '../constants';

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.FETCH_TABS_REQUEST: {
      return { ...state };
    }
    case actionTypes.FETCH_TABS_SUCCESS: {
      return { ...state, tabs: action.tabs };
    }
    case actionTypes.FETCH_TABS_FAILURE: {
      return { ...state };
    }
    case actionTypes.UPDATE_ASSESSMENT_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.UPDATE_ASSESSMENT_SUCCESS:
    case actionTypes.UPDATE_ASSESSMENT_FAILURE: {
      return { ...state, disabled: false };
    }
    default:
      return state;
  }
}
