import actionTypes from '../constants';

const initialState = {
  visible: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.ASSESSMENT_FORM_SHOW: {
      return { ...state, visible: true };
    }
    default:
      return state;
  }
}
