import { AppState } from 'store';

import { LevelsState } from './types';

export const getLevels = (state: AppState): LevelsState => {
  return state.levels;
};
