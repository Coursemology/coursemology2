import actionTypes from '../constants';

const initialState = false;

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_SURVEYS_SUCCESS: {
      return action.canCreate;
    }
    default:
      return state;
  }
}
