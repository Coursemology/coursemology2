import {
  AnnouncementData,
  AnnouncementListData,
} from 'types/system/announcements';
import {
  SaveAnnouncementsListAction,
  SaveAnnouncementAction,
  DeleteAnnouncementAction,
  SAVE_ANNOUNCEMENTS_LIST,
  DELETE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENT,
} from './types';

export function saveAnnouncementsList(
  announcements: AnnouncementListData[],
): SaveAnnouncementsListAction {
  return {
    type: SAVE_ANNOUNCEMENTS_LIST,
    announcements,
  };
}

export function saveAnnouncement(
  announcement: AnnouncementData,
): SaveAnnouncementAction {
  return { type: SAVE_ANNOUNCEMENT, announcement };
}

export function deleteAnnouncement(
  announcementId: number,
): DeleteAnnouncementAction {
  return {
    type: DELETE_ANNOUNCEMENT,
    id: announcementId,
  };
}
