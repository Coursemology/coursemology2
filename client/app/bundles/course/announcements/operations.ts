import { Operation } from 'store';
import { AnnouncementFormData } from 'types/course/announcements';

import CourseAPI from 'api/course';

import { actions } from './store';

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 */
const formatAttributes = (data: AnnouncementFormData): FormData => {
  const payload = new FormData();

  ['title', 'content', 'sticky', 'startAt', 'endAt'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'startAt':
          payload.append('announcement[start_at]', data[field].toString());
          break;
        case 'endAt':
          payload.append('announcement[end_at]', data[field].toString());
          break;
        default:
          payload.append(`announcement[${field}]`, data[field]);
          break;
      }
    }
  });
  return payload;
};

export function fetchAnnouncements(): Operation {
  return async (dispatch) =>
    CourseAPI.announcements.index().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveAnnouncementList(
          data.announcementTitle,
          data.announcements,
          data.permissions,
        ),
      );
    });
}

export function createAnnouncement(formData: AnnouncementFormData): Operation {
  const attributes = formatAttributes(formData);
  return async (dispatch) =>
    CourseAPI.announcements.create(attributes).then((response) => {
      dispatch(actions.saveAnnouncement(response.data));
    });
}

export function updateAnnouncement(
  announcementId: number,
  formData: AnnouncementFormData,
): Operation {
  const attributes = formatAttributes(formData);
  return async (dispatch) =>
    CourseAPI.announcements
      .update(announcementId, attributes)
      .then((response) => {
        dispatch(actions.saveAnnouncement(response.data));
      });
}

export function deleteAnnouncement(accouncementId: number): Operation {
  return async (dispatch) =>
    CourseAPI.announcements.delete(accouncementId).then(() => {
      dispatch(actions.deleteAnnouncement(accouncementId));
    });
}
