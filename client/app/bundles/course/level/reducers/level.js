import actionTypes from 'course/level/constants';

const initialState = {
  levels: [],
  isLoading: false,
};

function isNumeric(n) {
  return Number.isFinite(parseInt(n, 10));
}

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
    case actionTypes.UPDATE_EXP_THRESHOLD: {
      const { payload } = action;
      const { levels } = state;
      const copiedLevels = levels.slice();
      if (payload.newValue === "") {
        // Allows the textbox to be empty if the user removes all the digits.
        copiedLevels[payload.levelNumber] = "";
      }
      else if (isNumeric(payload.newValue)) {
        copiedLevels[payload.levelNumber] = parseInt(payload.newValue);
      }

      return { ...state, levels: copiedLevels }
    }
    case actionTypes.SORT_LEVELS: {
      const { payload } = action;
      const { levels } = state;
      const copiedLevels = levels.slice();

      // Must specify a sort function or will get lexicographical sort.
      const sortedLevels = copiedLevels.sort((a, b) => a - b);

      return { ...state, levels: sortedLevels }
    }
    case actionTypes.ADD_LEVEL: {
      const { levels } = state;
      const copiedLevels = levels.slice();

      // Add a new level with twice the exp of the previous level.
      copiedLevels.push(levels[levels.length-1] * 2 );

      return { ...state, levels: copiedLevels }
    }
    case actionTypes.DELETE_LEVEL: {
      const { payload } = action;
      const { levels } = state;
      const copiedLevels = levels.slice();
      // Delete 1 item from the levelNumber position.
      copiedLevels.splice(payload.levelNumber, 1);

      return { ...state, levels: copiedLevels }
    }
    default:
      return state;
  }
}
