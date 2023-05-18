import produce from 'immer';

import actionTypes from './constants';
import { UserEmailSubscriptionsState } from './types';

const initialState: UserEmailSubscriptionsState = {
  settings: [],
  pageFilter: {
    category_id: null,
    component: null,
    setting: null,
    show_all_settings: false,
  },
};

const reducer = produce((state, action) => {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_USER_EMAIL_SUBSCRIPTION_SUCCESS:
      return action.allEmailSubscriptions;
    case actionTypes.USER_EMAIL_SUBSCRIPTION_UPDATE_SUCCESS:
      return action.updatedEmailSubscriptions;
    default:
      return state;
  }
}, initialState);

export default reducer;
