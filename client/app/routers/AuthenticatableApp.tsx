import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { hasStoredUser } from 'utilities/authentication';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import {
  INVALID_GRANT_ERROR,
  useAuthAdapter,
} from 'lib/components/wrappers/AuthProvider';

const AuthenticatedApp = lazy(
  () => import(/* webpackChunkName: "AuthenticatedApp" */ './AuthenticatedApp'),
);

const UnauthenticatedApp = lazy(
  () =>
    import(/* webpackChunkName: "UnauthenticatedApp" */ './UnauthenticatedApp'),
);

const AuthenticatableApp = (): JSX.Element => {
  const auth = useAuthAdapter();

  /**
   * The stored access token expires (15 minutes) long before the Keycloak SSO
   * session does (up to 7 days with remember-me), so a user returning after a
   * gap boots with `isAuthenticated` false even though their session is intact
   * and silently renewable. Rendering `UnauthenticatedApp` in that window serves
   * signed-in users the public shell, and any request made from it carries a
   * dead bearer token.
   *
   * So when a stored session exists, block on a silent renew and only fall
   * through to `UnauthenticatedApp` once we know the session is really gone.
   */
  const [isRecoveringSession, setIsRecoveringSession] = useState(hasStoredUser);
  const isRecoveryAttempted = useRef(false);

  useEffect(() => {
    if (!isRecoveringSession || auth.isLoading || isRecoveryAttempted.current)
      return;

    if (auth.isAuthenticated) {
      setIsRecoveringSession(false);
      return;
    }

    isRecoveryAttempted.current = true;

    auth.signinSilent().finally(() => setIsRecoveringSession(false));
  }, [auth.isLoading, auth.isAuthenticated, isRecoveringSession]);

  switch (auth.activeNavigator) {
    case 'signinRedirect':
    case 'signoutRedirect':
      return (
        <LoadingIndicator
          containerClassName="h-screen items-center"
          size={125}
        />
      );
    default:
      break;
  }

  // type definition for auth.error depends on the auth server error response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = auth.error as any | undefined;

  if (error?.error === INVALID_GRANT_ERROR) {
    auth.signinRedirect({ redirect_uri: window.location.href });
  }

  // A failed silent renew is an expected outcome when a stored session has
  // lapsed, so it must not replace the page with an error. `invalid_grant` is
  // handled above by sending the user to sign in again; anything else (Keycloak
  // unreachable, JWKS fetch failure) falls through to the public shell, which is
  // what a visitor would have seen before we attempted recovery at all.
  const recoveryFailed = error?.source === 'signinSilent';

  if (auth.error && !recoveryFailed)
    return <div>Something is wrong: {auth.error.message}</div>;

  if (auth.isLoading || isRecoveringSession)
    return (
      <LoadingIndicator containerClassName="h-screen items-center" size={125} />
    );

  return (
    <Suspense
      fallback={
        <LoadingIndicator.Delayed
          containerClassName="h-screen items-center"
          delayedForMS={250}
          size={125}
        />
      }
    >
      {auth.isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </Suspense>
  );
};

export default AuthenticatableApp;
