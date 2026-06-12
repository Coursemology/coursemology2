import { useEffect } from 'react';
import { Outlet, useRouteError } from 'react-router-dom';

import { actions } from 'bundles/users/store';
import NotificationPopup from 'lib/containers/NotificationPopup';
import { useAppDispatch } from 'lib/hooks/store';

import { loader, useAppLoader } from './AppLoader';
import GlobalAnnouncements from './GlobalAnnouncements';
import ServerUnreachableBanner from './ServerUnreachableBanner';

const AppContainer = (): JSX.Element => {
  const data = useAppLoader();
  const homeData = data.home;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (homeData.user) {
      dispatch(
        actions.saveUser({
          id: homeData.user.id,
          name: homeData.user.name,
          imageUrl: homeData.user.avatarUrl,
        }),
      );
    }
  }, [homeData.user?.id]);

  return (
    <div className="flex h-screen flex-col">
      {data.serverErroring && <ServerUnreachableBanner />}

      {Boolean(data.announcements?.length) && (
        <GlobalAnnouncements in={data.announcements!} />
      )}

      <Outlet context={homeData} />

      <NotificationPopup />
    </div>
  );
};

/**
 * Rethrows the error from React Router so that `ErrorBoundary` can catch it
 * and generate the `componentStack` from `ErrorInfo`.
 *
 * As of React Router 6.14.1, there is no way to get `componentStack` without
 * `componentDidCatch` from a proper `ErrorBoundary`.
 */
const AppErrorBubbler = (): JSX.Element => {
  throw useRouteError();
};

export default Object.assign(AppContainer, {
  loader,
  ErrorBoundary: AppErrorBubbler,
});
