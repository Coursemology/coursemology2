import { Outlet } from 'react-router-dom';

import NotificationPopup from 'lib/containers/NotificationPopup';

import { loader, useAppLoader } from './AppLoader';
import GlobalAnnouncements from './GlobalAnnouncements';
import MasqueradeBanner from './MasqueradeBanner';

const AppContainer = (): JSX.Element => {
  const data = useAppLoader();
  const homeData = data.home;

  return (
    <div className="flex h-screen flex-col">
      {homeData.stopMasqueradingUrl && homeData.masqueradeUserName && (
        <MasqueradeBanner
          as={homeData.masqueradeUserName}
          stopMasqueradingUrl={homeData.stopMasqueradingUrl}
        />
      )}

      {Boolean(data.announcements?.length) && (
        <GlobalAnnouncements in={data.announcements} />
      )}

      <Outlet context={homeData} />

      <NotificationPopup />
    </div>
  );
};

export default Object.assign(AppContainer, { loader });
