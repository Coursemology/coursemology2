import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementPermissions,
} from 'types/course/announcements';

import {
  DELETE_ANNOUNCEMENT,
  DeleteAnnouncementAction,
  SAVE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENT_LIST,
  SaveAnnouncementAction,
  SaveAnnouncementListAction,
} from './types';

export function saveAnnouncementList(
  announcementList: AnnouncementListData[],
  announcementPermissions: AnnouncementPermissions,
): SaveAnnouncementListAction {
  return {
    type: SAVE_ANNOUNCEMENT_LIST,
    announcementList,
    announcementPermissions,
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
