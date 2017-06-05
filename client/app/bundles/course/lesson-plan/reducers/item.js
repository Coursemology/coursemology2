import actionTypes from '../constants';

export default function (state = {}, action) {
  if (String(state.id) !== String(action.itemId)) {
    return state;
  }

  switch (action.type) {
    case actionTypes.ITEM_UPDATE_SUCCESS: {
      return { ...state, ...action.values };
    }
    default:
      return state;
  }
}
