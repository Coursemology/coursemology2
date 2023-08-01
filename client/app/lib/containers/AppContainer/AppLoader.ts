import { useLoaderData, useOutletContext } from 'react-router-dom';
import { AxiosError } from 'axios';
import { AnnouncementMiniEntity } from 'types/course/announcements';
import { HomeLayoutData } from 'types/home';

import GlobalAPI from 'api';
import { redirectToDefaultNotFound } from 'lib/hooks/router/redirect';
import { imperativeAuthenticator, setI18nConfig } from 'lib/hooks/session';

interface AppLoaderData {
  home: HomeLayoutData;
  announcements: AnnouncementMiniEntity[];
}

export const loader = async (): Promise<AppLoaderData> => {
  try {
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
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404)
      redirectToDefaultNotFound();

    throw error;
  }
};

export const useAppLoader = (): AppLoaderData =>
  useLoaderData() as AppLoaderData;

export const useAppContext = (): HomeLayoutData => useOutletContext();
