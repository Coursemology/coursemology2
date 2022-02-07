import actionTypes from '../constants';
import { sortByName } from '../utils/sort';

const initialState = {
  isManagingGroups: false,
  hasFetchUserError: false,
  courseUsers: [],
  selectedGroupId: -1,
  modifiedGroups: [],
  isUpdating: false,
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
      const newCourseUsers = [...action.courseUsers];
      newCourseUsers.sort(sortByName);
      return { ...state, courseUsers: newCourseUsers };
    }
    case actionTypes.FETCH_USERS_FAILURE: {
      return { ...state, hasFetchUserError: true };
    }
    case actionTypes.SET_SELECTED_GROUP_ID: {
      return { ...state, selectedGroupId: action.selectedGroupId };
    }
    case actionTypes.UPDATE_GROUP_SUCCESS: {
      const index = state.modifiedGroups.findIndex(
        (g) => g.id === action.group.id,
      );
      if (index === -1) {
        return state;
      }
      const newModifiedGroups = state.modifiedGroups.splice();
      newModifiedGroups[index] = {
        ...newModifiedGroups[index],
        name: action.group.name,
        description: action.group.description,
      };
      return { ...state, modifiedGroups: newModifiedGroups };
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
      const newModifiedGroups = [
        ...state.modifiedGroups.filter((g) => g.id !== action.group.id),
        action.group,
      ];
      newModifiedGroups.sort(sortByName);
      return { ...state, modifiedGroups: newModifiedGroups };
    }
    case actionTypes.UPDATE_GROUP_MEMBERS_REQUEST: {
      return { ...state, isUpdating: true };
    }
    case actionTypes.UPDATE_GROUP_MEMBERS_SUCCESS:
    case actionTypes.UPDATE_GROUP_MEMBERS_FAILURE: {
      return { ...state, isUpdating: false };
    }
    default:
      return state;
  }
}
