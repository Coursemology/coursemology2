import actionTypes from '../constants';

const initialState = {
  isManagingGroups: false,
  hasFetchUserError: false,
  courseUsers: [],
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.MANAGE_GROUPS_START: {
      return { ...state, isManagingGroups: true };
    }
    case actionTypes.FETCH_USERS_SUCCESS: {
      return { ...state, users: action.courseUsers };
    }
    case actionTypes.FETCH_USERS_FAILURE: {
      return { ...state, hasFetchUserError: true };
    }
    default:
      return state;
  }
}
