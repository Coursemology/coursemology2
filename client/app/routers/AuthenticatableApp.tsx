import { lazy, Suspense } from 'react';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAuthAdapter } from 'lib/components/wrappers/AuthProvider';

const AuthenticatedApp = lazy(
  () => import(/* webpackChunkName: "AuthenticatedApp" */ './AuthenticatedApp'),
);

const UnauthenticatedApp = lazy(
  () =>
    import(/* webpackChunkName: "UnauthenticatedApp" */ './UnauthenticatedApp'),
);

const AuthenticatableApp = (): JSX.Element => {
  const auth = useAuthAdapter();

  if (auth.error) return <div>Something is wrong</div>;

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
