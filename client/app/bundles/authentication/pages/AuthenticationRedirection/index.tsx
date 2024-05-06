import {
  oidcConfig,
  useAuthAdapter,
} from 'lib/components/wrappers/AuthProvider';
import { Redirectable, useNextURL } from 'lib/hooks/router/redirect';

const AuthenticationRedirection = (): JSX.Element | null => {
  const auth = useAuthAdapter();
  const { nextURL } = useNextURL();
  const redirectUri = nextURL
    ? `${window.origin}${nextURL}`
    : oidcConfig.redirect_uri;

  if (auth.isAuthenticated) <Redirectable />;

  auth.signinRedirect({ redirect_uri: redirectUri });

  return null;
};

export default AuthenticationRedirection;
