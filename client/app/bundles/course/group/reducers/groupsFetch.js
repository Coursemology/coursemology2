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
      // const map = new Map();
      // action.categories.forEach((c) =>
      //   c.groups.forEach((g) => {
      //     g.members.forEach((m) => {
      //       if (!map.has(m.courseUserId)) {
      //         map.set(m.courseUserId, []);
      //       }
      //       map.get(m.courseUserId).push({
      //         categoryName: c.name,
      //         groupId: g.id,
      //         groupName: g.name,
      //         groupUserId: m.id,
      //         groupRole: m.groupRole,
      //       });
      //     });
      //   }),
      // );

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
    default:
      return state;
  }
}
