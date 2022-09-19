/* eslint-disable import/prefer-default-export */
import { Operation } from 'types/store';
import GlobalAnnouncementsAPI from 'api/Announcements';
import * as actions from './actions';

export function indexAnnouncements(): Operation<void> {
  return async (dispatch) =>
    GlobalAnnouncementsAPI.announcements.index().then((response) => {
      const data = response.data;
      dispatch(actions.saveAnnouncementsList(data.announcements));
    });
}
