import actionTypes from '../constants';

const initialState = {
  visible: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.ASSESSMENT_FORM_SHOW: {
      return { ...state, visible: true };
    }
    case actionTypes.CREATE_ASSESSMENT_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.CREATE_ASSESSMENT_SUCCESS: {
      return { ...state, visible: false, disabled: false };
    }
    case actionTypes.CREATE_ASSESSMENT_FAILURE: {
      return { ...state, disabled: false };
    }
    default:
      return state;
  }
}
