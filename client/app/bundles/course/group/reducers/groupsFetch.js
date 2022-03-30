import actionTypes from '../constants';
import { sortByName } from '../utils/sort';

const initialState = {
  isFetching: false,
  hasFetchError: false,
  groupCategory: null,
  groups: [],
  canManageCategory: false,
  canManageGroups: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_GROUPS_REQUEST: {
      return { ...state, isFetching: true };
    }
    case actionTypes.FETCH_GROUPS_SUCCESS: {
      const newGroups = [...action.groups];
      newGroups.sort(sortByName);
      return {
        ...state,
        groupCategory: action.groupCategory,
        groups: newGroups,
        isFetching: false,
        canManageCategory: action.canManageCategory,
        canManageGroups: action.canManageGroups,
      };
    }
    case actionTypes.FETCH_GROUPS_FAILURE: {
      return {
        ...state,
        isFetching: false,
        hasFetchError: true,
      };
    }
    case actionTypes.UPDATE_CATEGORY_SUCCESS: {
      return {
        ...state,
        groupCategory: action.groupCategory,
      };
    }
    case actionTypes.UPDATE_GROUP_SUCCESS: {
      const filteredGroups = state.groups.filter(
        (g) => g.id !== action.group.id,
      );
      const newGroups = [...filteredGroups, action.group];
      newGroups.sort(sortByName);
      return {
        ...state,
        groups: newGroups,
      };
    }
    case actionTypes.CREATE_GROUP_SUCCESS: {
      const newGroups = [...state.groups, ...action.groups];
      newGroups.sort(sortByName);
      return {
        ...state,
        groups: newGroups,
      };
    }
    case actionTypes.DELETE_GROUP_SUCCESS: {
      const newGroups = state.groups.filter((g) => g.id !== action.id);
      return { ...state, groups: newGroups };
    }
    default:
      return state;
  }
}
