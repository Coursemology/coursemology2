/* eslint-disable import/prefer-default-export */
import { Operation } from 'types/store';

import GlobalAPI from 'api';

import * as actions from './actions';

export function indexAnnouncements(): Operation {
  return async (dispatch) =>
    GlobalAPI.announcements.index().then((response) => {
      const data = response.data;
      dispatch(actions.saveAnnouncementsList(data.announcements));
    });
}
