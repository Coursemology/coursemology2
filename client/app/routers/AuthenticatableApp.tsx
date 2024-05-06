import { lazy, Suspense } from 'react';

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

  if (auth.error) return <div>Something is wrong: {auth.error.message}</div>;

  if (auth.isLoading)
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
