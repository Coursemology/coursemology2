import { createSelector, Dispatch } from '@reduxjs/toolkit';
import { AppState, dispatch as imperativeDispatch, store } from 'store';

import { actions, SessionState } from 'bundles/common/store';

import { useAppDispatch, useAppSelector } from './store';

const selectSessionStore = (state: AppState): SessionState => state.session;

const selectI18nConfig = createSelector(selectSessionStore, (session) => ({
  locale: session.locale,
  timeZone: session.timeZone,
}));

interface UseAuthenticatorHook {
  authenticate: () => void;
  deauthenticate: () => void;
}

/**
 * NEVER export this method or attempt to use it anywhere else without good reasons.
 * Ideally, developers should seek to use `useAuthState` where possible. This is
 * an internal implementation to prevent repeated dispatches.
 */
const getAuthState = (): boolean => store.getState()?.session?.authenticated;

const createAuthenticator = (dispatch: Dispatch): UseAuthenticatorHook => ({
  authenticate: (): void => {
    if (getAuthState()) return;
    dispatch(actions.setAuthenticated(true));
  },
  deauthenticate: (): void => {
    if (!getAuthState()) return;
    dispatch(actions.setAuthenticated(false));
  },
});

export const useAuthenticator = (): UseAuthenticatorHook => {
  const dispatch = useAppDispatch();

  return createAuthenticator(dispatch);
};

interface I18nConfig {
  locale: string;
  timeZone: string;
}

export const useI18nConfig = (): I18nConfig => useAppSelector(selectI18nConfig);

export const setI18nConfig = (config: Partial<I18nConfig>): void => {
  const session = store.getState()?.session;
  const currentLocale = session?.locale;
  const currentTimeZone = session?.timeZone;
  if (currentLocale === config.locale && currentTimeZone === config.timeZone)
    return;

  imperativeDispatch(actions.setI18nConfig(config));
};
