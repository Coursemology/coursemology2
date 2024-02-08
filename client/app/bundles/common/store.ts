import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  DEFAULT_LOCALE,
  DEFAULT_TIME_ZONE,
} from 'lib/constants/sharedConstants';

/**
 * For now, we store a boolean instead of `userId?: number` because there
 * isn't a need to store the `userId` at time of writing.
 *
 * A boolean is kept here to prevent future developers from trying to use
 * `userId` when its state update isn't fully thought out. If we ever
 * decide to use `userId` more than just an indicator of authentication
 * state, we can `SessionState` and `useAuthState`. These abstractions
 * were made to make it easier to change the authentication implementations.
 */
export interface SessionState {
  authenticated: boolean;
  locale: string;
  timeZone: string;
}

const initialState: SessionState = {
  authenticated: false,
  locale: DEFAULT_LOCALE,
  timeZone: DEFAULT_TIME_ZONE,
};

export const sessionStore = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload;
    },
    setI18nConfig: (
      state,
      action: PayloadAction<{ locale?: string; timeZone?: string }>,
    ) => {
      state.locale = action.payload.locale ?? DEFAULT_LOCALE;
      state.timeZone = action.payload.timeZone ?? DEFAULT_TIME_ZONE;
    },
  },
});

export const actions = sessionStore.actions;

export default sessionStore.reducer;
