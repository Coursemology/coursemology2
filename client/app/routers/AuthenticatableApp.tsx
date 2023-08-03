import { lazy, Suspense } from 'react';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAuthState } from 'lib/hooks/session';

const AuthenticatedApp = lazy(
  () => import(/* webpackChunkName: "AuthenticatedApp" */ './AuthenticatedApp'),
);

const UnauthenticatedApp = lazy(
  () =>
    import(/* webpackChunkName: "UnauthenticatedApp" */ './UnauthenticatedApp'),
);

const AuthenticatableApp = (): JSX.Element => {
  const authenticated = useAuthState();

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
      {authenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </Suspense>
  );
};

export default AuthenticatableApp;
