import actionTypes from 'course/level/constants';

const initialState = {
  levels: [],
  isLoading: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_LEVELS_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.LOAD_LEVELS_SUCCESS: {
      const { levelData } = action;

      return {
        ...state,
        ...levelData,
        isLoading: false
      }
    }
    case actionTypes.LOAD_LEVELS_FAILURE: {
      return { ...state, isLoading: false }
    }
    default:
      return state;
  }
}
