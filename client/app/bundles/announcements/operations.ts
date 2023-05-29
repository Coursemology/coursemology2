import { Operation } from 'store';

import GlobalAPI from 'api';

import { saveAnnouncementsList } from './store';

export function indexAnnouncements(): Operation {
  return async (dispatch) =>
    GlobalAPI.announcements.index().then((response) => {
      const data = response.data;
      dispatch(saveAnnouncementsList(data.announcements));
    });
}
