import { configureStore } from '@reduxjs/toolkit';

import forumReducer from './reducers';

export const store = configureStore({ reducer: { forums: forumReducer } });

export type RootState = ReturnType<typeof store.getState>;
