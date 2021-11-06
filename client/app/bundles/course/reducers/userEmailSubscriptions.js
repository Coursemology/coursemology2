import actionTypes from '../constants';

const initialState = {};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_USER_EMAIL_SUBSCRIPTION_SUCCESS:
      return action.allEmailSubscriptions;
    case actionTypes.USER_EMAIL_SUBSCRIPTION_UPDATE_SUCCESS:
      return action.updatedEmailSubscriptions;
    default:
      return state;
  }
}
