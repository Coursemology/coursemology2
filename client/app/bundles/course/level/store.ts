import { produce } from 'immer';
import { LevelsState } from 'types/course/levels';

import actionTypes from './constants';

const initialState: LevelsState = {
  canManage: false,
  levels: [],
  isLoading: false,
  isSaving: false,
};

const isNumeric = (n: string): boolean => Number.isFinite(parseInt(n, 10));

const reducer = produce((state, action) => {
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
        isLoading: false,
      };
    }
    case actionTypes.LOAD_LEVELS_FAILURE: {
      return { ...state, isLoading: false };
    }
    case actionTypes.UPDATE_EXP_THRESHOLD: {
      const { payload } = action;
      const { levels } = state;
      const copiedLevels = levels.slice();
      if (payload.newValue === '') {
        // Allows the textbox to be empty if the user removes all the digits.
        copiedLevels[payload.levelNumber] = '';
      } else if (isNumeric(payload.newValue)) {
        copiedLevels[payload.levelNumber] = parseInt(payload.newValue, 10);
      }

      return { ...state, levels: copiedLevels };
    }
    case actionTypes.SORT_LEVELS: {
      const { levels } = state;
      const copiedLevels = levels.slice();

      // Must specify a sort function or will get lexicographical sort.
      const sortedLevels = copiedLevels.sort((a, b) => +a - +b);

      return { ...state, levels: sortedLevels };
    }
    case actionTypes.ADD_LEVEL: {
      const { levels } = state;
      const copiedLevels = levels.slice();

      const previousLevel = levels[levels.length - 1];

      // Add a new level with twice the exp of the previous level.
      if (typeof previousLevel === 'number') {
        copiedLevels.push(previousLevel * 2);
      }

      return { ...state, levels: copiedLevels };
    }
    case actionTypes.DELETE_LEVEL: {
      const { payload } = action;
      const { levels } = state;
      const copiedLevels = levels.slice();
      // Delete 1 item from the levelNumber position.
      copiedLevels.splice(payload.levelNumber, 1);

      return { ...state, levels: copiedLevels };
    }
    case actionTypes.SAVE_LEVELS: {
      return { ...state, isSaving: true };
    }
    case actionTypes.SAVE_LEVELS_SUCCESS: {
      return { ...state, isSaving: false };
    }
    case actionTypes.SAVE_LEVELS_FAILURE: {
      return { ...state, isSaving: false };
    }
    default:
      return state;
  }
}, initialState);

export default reducer;
