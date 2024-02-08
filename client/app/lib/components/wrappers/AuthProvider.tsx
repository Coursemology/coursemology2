import { ReactNode } from 'react';
import { AuthProvider as OIDCAuthProvider } from 'react-oidc-context';
import { type User, WebStorageStateStore } from 'oidc-client-ts';

interface AuthProviderProps {
  children: ReactNode;
}

const onSigninCallback = (_user: User | void): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

const oidcConfig = {
  authority: process.env.OIDC_AUTHORITY,
  client_id: process.env.OIDC_CLIENT_ID,
  redirect_uri: process.env.OIDC_REDIRECT_URI,
  userStore: new WebStorageStateStore({ store: window.localStorage }), // To persist login information across different sessions
  post_logout_redirect_uri: process.env.OIDC_REDIRECT_URI,
  automaticSilentRenew: true,
  onSigninCallback,
};

const AuthProvider = (props: AuthProviderProps): JSX.Element => {
  return <OIDCAuthProvider {...oidcConfig}>{props.children}</OIDCAuthProvider>;
};

export default AuthProvider;
