import actionTypes from '../constants';

const initialState = {
  canCreate: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_SURVEYS_SUCCESS: {
      return { ...state, canCreate: action.canCreate };
    }
    default:
      return state;
  }
}
