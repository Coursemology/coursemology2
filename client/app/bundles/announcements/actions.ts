/* eslint-disable import/prefer-default-export */
import { AnnouncementListData } from 'types/course/announcements';
import { SaveAnnouncementListAction, SAVE_ANNOUNCEMENT_LIST } from './types';

export function saveAnnouncementsList(
  announcements: AnnouncementListData[],
): SaveAnnouncementListAction {
  return {
    type: SAVE_ANNOUNCEMENT_LIST,
    announcements,
  };
}
