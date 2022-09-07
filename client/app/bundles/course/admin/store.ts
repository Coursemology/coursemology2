import { configureStore } from '@reduxjs/toolkit';

import lessonPlanSettingsReducer from './reducers/lessonPlanSettings';
import notificationSettingsReducer from './reducers/notificationSettings';

export const store = configureStore({
  reducer: {
    lessonPlanSettings: lessonPlanSettingsReducer,
    notificationSettings: notificationSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
