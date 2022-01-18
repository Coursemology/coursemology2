import actionTypes from '../constants';

const initialState = {
  isFetching: false,
  hasFetchError: false,
  groupCategory: null,
  groups: [],
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_GROUPS_REQUEST: {
      return { ...state, isFetching: true };
    }
    case actionTypes.FETCH_GROUPS_SUCCESS: {
      return {
        ...state,
        groupCategory: action.groupCategory,
        groups: action.groups,
        isFetching: false,
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
      newGroups.sort((a, b) => a.name.localeCompare(b.name));
      return {
        ...state,
        groups: newGroups,
      };
    }
    case actionTypes.CREATE_GROUP_SUCCESS: {
      const newGroups = [...state.groups, ...action.groups];
      newGroups.sort((a, b) => a.name.localeCompare(b.name));
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
