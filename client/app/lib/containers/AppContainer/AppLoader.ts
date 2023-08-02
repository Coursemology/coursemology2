import { useLoaderData, useOutletContext } from 'react-router-dom';
import { AnnouncementMiniEntity } from 'types/course/announcements';
import { HomeLayoutData } from 'types/home';

import GlobalAPI from 'api';
import { imperativeAuthenticator, setI18nConfig } from 'lib/hooks/session';

interface AppLoaderData {
  home: HomeLayoutData;
  announcements: AnnouncementMiniEntity[];
}

export const loader = async (): Promise<AppLoaderData> => {
  const { data: home } = await GlobalAPI.home.fetch();
  const { data: announcements } = await GlobalAPI.announcements.index(true);

  setI18nConfig({
    locale: home.locale,
    timeZone: home.timeZone ?? undefined,
  });

  if (home.user) {
    imperativeAuthenticator.authenticate();
  } else {
    imperativeAuthenticator.deauthenticate();
  }

  return { home, announcements: announcements.announcements };
};

export const useAppLoader = (): AppLoaderData =>
  useLoaderData() as AppLoaderData;

export const useAppContext = (): HomeLayoutData => useOutletContext();
