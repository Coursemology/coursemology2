import actionTypes from '../constants';

const initialState = {
  isFetching: false,
  hasFetchError: false,
  categories: [],
  courseUsers: [],
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_GROUPS_REQUEST: {
      return { ...state, isFetching: true };
    }
    case actionTypes.FETCH_GROUPS_SUCCESS: {
      const map = new Map();
      action.categories.forEach((c) =>
        c.groups.forEach((g) => {
          g.members.forEach((m) => {
            if (!map.has(m.courseUserId)) {
              map.set(m.courseUserId, []);
            }
            map.get(m.courseUserId).push({
              categoryName: c.name,
              groupId: g.id,
              groupName: g.name,
              groupUserId: m.id,
              groupRole: m.groupRole,
            });
          });
        }),
      );

      return {
        ...state,
        categories: action.categories,
        courseUsers: action.courseUsers.map((s) => ({
          ...s,
          groups: map.has(s.id) ? map.get(s.id) : [],
        })),
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
    default:
      return state;
  }
}
