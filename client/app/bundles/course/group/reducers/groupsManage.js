import actionTypes from '../constants';

const initialState = {
  isManagingGroups: false,
  hasFetchUserError: false,
  courseUsers: [],
  selectedGroupId: -1,
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
    case actionTypes.SET_SELECTED_GROUP_ID: {
      return { ...state, selectedGroupId: action.selectedGroupId };
    }
    case actionTypes.DELETE_GROUP_SUCCESS: {
      if (state.selectedGroupId === action.id) {
        return { ...state, selectedGroupId: -1 };
      }
      return state;
    }
    default:
      return state;
  }
}
