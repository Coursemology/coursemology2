import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';

import submissionsReducer from './bundles/course/assessment/submissions/store';

enableMapSet();

const rootReducer = combineReducers({
  submissions: submissionsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

// TODO: Replace `AppState` and `AppDispatch` from `types/store` with these.
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
