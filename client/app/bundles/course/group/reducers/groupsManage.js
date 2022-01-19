import actionTypes from '../constants';

const initialState = {
  isManagingGroups: false,
  hasFetchUserError: false,
  courseUsers: [],
  selectedGroupId: -1,
  modifiedGroups: [],
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.MANAGE_GROUPS_START: {
      return { ...state, isManagingGroups: true };
    }
    case actionTypes.MANAGE_GROUPS_END: {
      return {
        ...state,
        isManagingGroups: false,
        selectedGroupId: -1,
        modifiedGroups: [],
      };
    }
    case actionTypes.FETCH_USERS_SUCCESS: {
      return { ...state, courseUsers: action.courseUsers };
    }
    case actionTypes.FETCH_USERS_FAILURE: {
      return { ...state, hasFetchUserError: true };
    }
    case actionTypes.SET_SELECTED_GROUP_ID: {
      return { ...state, selectedGroupId: action.selectedGroupId };
    }
    case actionTypes.DELETE_GROUP_SUCCESS: {
      const newModifiedGroups = state.modifiedGroups.filter(
        (g) => g.id !== action.id,
      );
      if (state.selectedGroupId === action.id) {
        return {
          ...state,
          selectedGroupId: -1,
          modifiedGroups: newModifiedGroups,
        };
      }
      return { ...state, modifiedGroups: newModifiedGroups };
    }
    case actionTypes.MODIFY_GROUP: {
      // We won't sort for this
      const newModifiedGroups = [
        ...state.modifiedGroups.filter((g) => g.id !== action.group.id),
        action.group,
      ];
      return { ...state, modifiedGroups: newModifiedGroups };
    }
    default:
      return state;
  }
}
