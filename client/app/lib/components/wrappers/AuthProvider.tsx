import { ReactNode, useEffect } from 'react';
import {
  type AuthContextProps,
  AuthProvider as OIDCAuthProvider,
  useAuth,
} from 'react-oidc-context';
import {
  type SigninRedirectArgs,
  type SignoutRedirectArgs,
  type SignoutSilentArgs,
  type User,
  UserManager,
  WebStorageStateStore,
} from 'oidc-client-ts';
import { revokeAccessTokenCookie } from 'utilities/authentication';

interface AuthProviderProps {
  children: ReactNode;
}

export const INVALID_GRANT_ERROR = 'invalid_grant';

const RECOVERY_ATTEMPTED_KEY = 'oidc_recovery_attempted';

const getCleanCallbackUrl = (): string => {
  const url = new URL(window.location.href);
  ['code', 'state', 'session_state', 'iss'].forEach((p) =>
    url.searchParams.delete(p),
  );
  return url.toString();
};

const onSigninCallback = (_user: User | void): void => {
  sessionStorage.removeItem(RECOVERY_ATTEMPTED_KEY);
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set('from', 'auth');
  window.history.replaceState({}, document.title, url.toString());
};

export const oidcConfig = {
  authority: process.env.OIDC_AUTHORITY!,
  client_id: process.env.OIDC_CLIENT_ID!,
  redirect_uri: process.env.OIDC_REDIRECT_URI!,
  userStore: new WebStorageStateStore({ store: window.localStorage }), // To persist login information across different sessions
  automaticSilentRenew: true,
  onSigninCallback,
};

export const AUTH_USER_MANAGER = new UserManager(oidcConfig);

/**
 * Recovers from auth errors that occur during the signin callback, typically
 * caused by a stale or mismatched `state` param (e.g. a bookmarked callback
 * URL, or localStorage cleared between redirect and return).
 *
 * Clears the stale OIDC state and attempts to re-authenticate the user.
 * If re-authentication fails again, returns the user to the home page to start a fresh login.
 */
const AuthErrorRecovery = (): null => {
  const { error, clearStaleState, signinRedirect } = useAuth();

  useEffect(() => {
    if (error?.source !== 'signinCallback') return;

    const alreadyAttempted = sessionStorage.getItem(RECOVERY_ATTEMPTED_KEY);

    clearStaleState().finally(() => {
      if (alreadyAttempted) {
        sessionStorage.removeItem(RECOVERY_ATTEMPTED_KEY);
        window.location.replace(window.location.origin);
      } else {
        sessionStorage.setItem(RECOVERY_ATTEMPTED_KEY, '1');
        signinRedirect({ redirect_uri: getCleanCallbackUrl() });
      }
    });
  }, [error, clearStaleState, signinRedirect]);

  return null;
};

const AuthProvider = (props: AuthProviderProps): JSX.Element => {
  return (
    <OIDCAuthProvider {...oidcConfig}>
      <AuthErrorRecovery />
      {props.children}
    </OIDCAuthProvider>
  );
};

interface AuthAdapterProps extends AuthContextProps {
  handleLogout: () => Promise<void>;
}

export const useAuthAdapter = (): AuthAdapterProps => {
  const { signinRedirect, signoutRedirect, signoutSilent, ...otherProps } =
    useAuth();

  // Return the user to the page they signed in from, not to the origin.
  const adaptedSignInRedirect = (args?: SigninRedirectArgs): Promise<void> =>
    signinRedirect({ redirect_uri: window.location.href, ...args });

  const adaptedSignOutRedirect = (args?: SignoutRedirectArgs): Promise<void> =>
    signoutRedirect({ post_logout_redirect_uri: window.origin, ...args });

  const adaptedSignOutSilent = (args?: SignoutSilentArgs): Promise<void> =>
    signoutSilent(args);

  // Not supported yet as signoutCallback from oidc-client-ts is not called in react-oidc-context.
  // Has been fixed in v3.1.0 in react-oidc-context but not released yet.

  /**
   * Every teardown step has to happen before `signoutRedirect`, which navigates the document away:
   * anything sequenced after it is racing page teardown and may simply not run.
   *
   * The server call is awaited rather than fired and forgotten for the same reason - an in-flight
   * request is cancelled by the navigation. It is awaited for delivery, not for its result: a user
   * signing out should never be shown an error, and the cookie's own JWT lapses shortly anyway, so
   * a failure is swallowed and sign out continues.
   */
  const handleLogout = async (): Promise<void> => {
    await revokeAccessTokenCookie().catch(() => undefined);
    await otherProps.removeUser();
    localStorage.clear();

    await adaptedSignOutRedirect();
  };

  return {
    handleLogout,
    signinRedirect: adaptedSignInRedirect,
    signoutRedirect: adaptedSignOutRedirect,
    signoutSilent: adaptedSignOutSilent,
    ...otherProps,
  };
};

export default AuthProvider;
