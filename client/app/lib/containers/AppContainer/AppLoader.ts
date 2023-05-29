import { useLoaderData, useOutletContext } from 'react-router-dom';
import { AnnouncementMiniEntity } from 'types/course/announcements';
import { HomeLayoutData } from 'types/home';

import GlobalAPI from 'api';

interface AppLoaderData {
  home: HomeLayoutData;
  announcements: AnnouncementMiniEntity[];
}

export const loader = async (): Promise<AppLoaderData> => ({
  home: (await GlobalAPI.home.fetch()).data,
  announcements: (await GlobalAPI.announcements.index(true)).data.announcements,
});

export const useAppLoader = (): AppLoaderData =>
  useLoaderData() as AppLoaderData;

export const useAppContext = (): HomeLayoutData => useOutletContext();
