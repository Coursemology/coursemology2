/* eslint-disable import/prefer-default-export */
import { AnnouncementListData } from 'types/course/announcements';

import { SAVE_ANNOUNCEMENT_LIST, SaveAnnouncementListAction } from './types';

export function saveAnnouncementsList(
  announcements: AnnouncementListData[],
): SaveAnnouncementListAction {
  return {
    type: SAVE_ANNOUNCEMENT_LIST,
    announcements,
  };
}
