import actionTypes from '../constants';

const initialState = {};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_USER_SUBSCRIPTION_SUCCESS:
      return action.allSubscriptions;
    case actionTypes.USER_SUBSCRIPTION_UPDATE_SUCCESS:
      return action.updatedSubscriptions;
    default:
      return state;
  }
}
