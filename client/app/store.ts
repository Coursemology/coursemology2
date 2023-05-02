import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';

import submissionsReducer from './bundles/course/assessment/submissions/store';
import disbursementReducer from './bundles/course/experience-points/disbursement/store';
import timelinesReducer from './bundles/course/reference-timelines/store';

enableMapSet();

const rootReducer = combineReducers({
  disbursement: disbursementReducer,
  submissions: submissionsReducer,
  timelines: timelinesReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

// TODO: Replace `AppState` and `AppDispatch` from `types/store` with these.
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
