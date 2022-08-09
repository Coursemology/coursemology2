import { Operation } from 'types/store';
import { AnnouncementFormData } from 'types/system/announcements';
import GlobalAnnouncementsAPI from 'api/Announcements';
import * as actions from './actions';

/**
 * Prepares and maps announcement object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { announcement :
 *     { title, content, sticky, startAt, endAt }
 *   }
 */
const formatAnnouncementAttributes = (data: AnnouncementFormData): FormData => {
  const payload = new FormData();
  const payloadPrefix =
    data.type === 'System::Announcement'
      ? 'system_announcement'
      : 'announcement';
  ['title', 'content', 'startAt', 'endAt'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'startAt':
          payload.append(`${payloadPrefix}[start_at]`, data[field]);
          break;
        case 'endAt':
          payload.append(`${payloadPrefix}[end_at]`, data[field]);
          break;
        default:
          payload.append(`${payloadPrefix}[${field}]`, data[field]);
          break;
      }
    }
  });
  return payload;
};

const getAnnouncementType = (data: AnnouncementFormData): string => {
  return data.type!;
};

export function indexAnnouncements(): Operation<void> {
  return async (dispatch) =>
    GlobalAnnouncementsAPI.announcements
      .index()
      .then((response) => {
        const data = response.data;
        dispatch(actions.saveAnnouncementsList(data.announcements));
      })
      .catch((error) => {
        throw error;
      });
}

export function updateAnnouncement(
  announcementId: number,
  formData: AnnouncementFormData,
): Operation<void> {
  const attributes = formatAnnouncementAttributes(formData);
  const announcementType = getAnnouncementType(formData);
  return async (dispatch) =>
    GlobalAnnouncementsAPI.announcements
      .update(announcementId, announcementType, attributes)
      .then((response) => {
        dispatch(actions.saveAnnouncement(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteAnnouncement(
  announcementId: number,
  announcementType?: string,
): Operation<void> {
  return async (dispatch) =>
    GlobalAnnouncementsAPI.announcements
      .delete(announcementId, announcementType!)
      .then(() => {
        dispatch(actions.deleteAnnouncement(announcementId));
      })
      .catch((error) => {
        throw error;
      });
}
