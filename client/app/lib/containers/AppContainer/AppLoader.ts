import { useLoaderData, useOutletContext } from 'react-router-dom';
import { AxiosError } from 'axios';
import { AnnouncementMiniEntity } from 'types/course/announcements';
import { HomeLayoutData } from 'types/home';

import GlobalAPI from 'api';
import {
  DEFAULT_LOCALE,
  DEFAULT_TIME_ZONE,
} from 'lib/constants/sharedConstants';
import { setI18nConfig } from 'lib/hooks/session';

interface AppLoaderData {
  home: HomeLayoutData;
  announcements?: AnnouncementMiniEntity[];
  serverErroring?: boolean;
}

export const loader = async (): Promise<AppLoaderData> => {
  try {
    const { data: home } = await GlobalAPI.home.fetch();
    const { data: announcements } = await GlobalAPI.announcements.index(true);

    setI18nConfig({
      locale: home.locale,
      timeZone: home.timeZone ?? undefined,
    });

    return { home, announcements: announcements.announcements };
  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response &&
      error.response?.status >= 500
    )
      return {
        home: {
          locale: DEFAULT_LOCALE,
          timeZone: DEFAULT_TIME_ZONE,
        },
        serverErroring: true,
      };

    throw error;
  }
};

export const useAppLoader = (): AppLoaderData =>
  useLoaderData() as AppLoaderData;

export const useAppContext = (): HomeLayoutData => useOutletContext();
