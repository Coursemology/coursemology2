import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LevelsData, LevelsState } from './types';

const initialState: LevelsState = {
  levels: [],
  canManage: false,
};

export const levelsSlice = createSlice({
  name: 'levels',
  initialState,
  reducers: {
    saveLevelsData: (state, action: PayloadAction<LevelsData>) => {
      state.levels = action.payload.levels;
      state.canManage = action.payload.canManage;
    },
  },
});

export const actions = levelsSlice.actions;

export default levelsSlice.reducer;
