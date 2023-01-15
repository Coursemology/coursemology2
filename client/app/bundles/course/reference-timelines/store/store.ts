import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';

import timelinesReducer from './timelinesSlice';

export const store = configureStore({
  reducer: { timelines: timelinesReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = Promise<void>> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
