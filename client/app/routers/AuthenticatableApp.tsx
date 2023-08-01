import { lazy, Suspense } from 'react';

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
    <Suspense>
      {authenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </Suspense>
  );
};

export default AuthenticatableApp;
