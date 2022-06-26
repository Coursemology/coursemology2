import { DeleteAnnouncementAction, DELETE_ANNOUNCEMENT } from './types';

// eslint-disable-next-line import/prefer-default-export
export function deleteAnnouncement(
  announcementId: number,
): DeleteAnnouncementAction {
  return {
    type: DELETE_ANNOUNCEMENT,
    id: announcementId,
  };
}
