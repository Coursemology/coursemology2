import CourseAPI from 'api/course';
import { AnnouncementFormData } from 'types/course/announcements';
import { Operation } from 'types/store';
import * as actions from './actions';

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { announcement :
 *     { title, description, badge: file }
 *   }
 */
const formatAttributes = (data: AnnouncementFormData): FormData => {
  const payload = new FormData();

  ['title', 'content', 'sticky', 'startAt', 'endAt'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'startAt':
          payload.append('announcement[start_at]', data[field]);
          break;
        case 'endAt':
          payload.append('announcement[end_at]', data[field]);
          break;
        default:
          payload.append(`announcement[${field}]`, data[field]);
          break;
      }
    }
  });
  return payload;
};

export function fetchAnnouncements(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.announcements
      .index()
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveAnnouncementList(data.announcements, data.permissions),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function createAnnouncement(
  formData: AnnouncementFormData,
): Operation<void> {
  const attributes = formatAttributes(formData);
  return async (dispatch) =>
    CourseAPI.announcements
      .create(attributes)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveAnnouncementList(data.announcements, data.permissions),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function updateAnnouncement(
  announcementId: number,
  formData: AnnouncementFormData,
): Operation<void> {
  const attributes = formatAttributes(formData);
  return async (dispatch) =>
    CourseAPI.announcements
      .update(announcementId, attributes)
      .then((response) => {
        dispatch(actions.saveAnnouncement(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteAnnouncement(accouncementId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.announcements
      .delete(accouncementId)
      .then(() => {
        dispatch(actions.deleteAnnouncement(accouncementId));
      })
      .catch((error) => {
        throw error;
      });
}
