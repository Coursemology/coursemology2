import { Outlet, useRouteError } from 'react-router-dom';

import NotificationPopup from 'lib/containers/NotificationPopup';

import { loader, useAppLoader } from './AppLoader';
import GlobalAnnouncements from './GlobalAnnouncements';
import ServerUnreachableBanner from './ServerUnreachableBanner';

const AppContainer = (): JSX.Element => {
  const data = useAppLoader();
  const homeData = data.home;

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
