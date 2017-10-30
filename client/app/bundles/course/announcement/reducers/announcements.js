import { updateOrAppend, deleteIfFound } from 'lib/helpers/reducer-helpers';
import actionTypes from '../constants';
import { sortAnnouncementsBySticky } from '../utils';


export default function (state = [], action) {
  switch (action.type) {
    case actionTypes.UPDATE_ANNOUNCEMENT_SUCCESS:
    case actionTypes.CREATE_ANNOUNCEMENT_SUCCESS: {
      const announcements = updateOrAppend(state, action.announcement);
      return sortAnnouncementsBySticky(announcements);
    }
    case actionTypes.LOAD_ANNOUNCEMENTS_SUCCESS: {
      return sortAnnouncementsBySticky(action.announcements);
    }
    case actionTypes.DELETE_ANNOUNCEMENT_SUCCESS: {
      return sortAnnouncementsBySticky(deleteIfFound(state, action.announcementId));
    }
    default:
      return state;
  }
}
