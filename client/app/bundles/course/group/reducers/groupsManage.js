import actionTypes from '../constants';

const initialState = {
  isManagingGroups: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.MANAGE_GROUPS_START: {
      return { ...state, isManagingGroups: true };
    }
    default:
      return state;
  }
}
