import { ReactNode } from 'react';
import {
  type AuthContextProps,
  AuthProvider as OIDCAuthProvider,
  useAuth,
} from 'react-oidc-context';
import Cookies from 'js-cookie';
import {
  type SigninRedirectArgs,
  type SignoutRedirectArgs,
  type SignoutSilentArgs,
  type User,
  UserManager,
  WebStorageStateStore,
} from 'oidc-client-ts';

interface AuthProviderProps {
  children: ReactNode;
}

export const INVALID_GRANT_ERROR = 'invalid_grant';

const onSigninCallback = (_user: User | void): void => {
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

const AuthProvider = (props: AuthProviderProps): JSX.Element => {
  return <OIDCAuthProvider {...oidcConfig}>{props.children}</OIDCAuthProvider>;
};

interface AuthAdapterProps extends AuthContextProps {
  handleLogout: () => Promise<void>;
}

export const useAuthAdapter = (): AuthAdapterProps => {
  const { signinRedirect, signoutRedirect, signoutSilent, ...otherProps } =
    useAuth();

  const adaptedSignInRedirect = (args?: SigninRedirectArgs): Promise<void> =>
    signinRedirect({ redirect_uri: window.origin, ...args });

  const adaptedSignOutRedirect = (args?: SignoutRedirectArgs): Promise<void> =>
    signoutRedirect({ post_logout_redirect_uri: window.origin, ...args });

  const adaptedSignOutSilent = (args?: SignoutSilentArgs): Promise<void> =>
    signoutSilent(args);

  // Not supported yet as signoutCallback from oidc-client-ts is not called in react-oidc-context.
  // Has been fixed in v3.1.0 in react-oidc-context but not released yet.

  const handleLogout = async (): Promise<void> => {
    await otherProps.removeUser();
    await adaptedSignOutRedirect();
    localStorage.clear();
    Cookies.remove('access_token');
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
