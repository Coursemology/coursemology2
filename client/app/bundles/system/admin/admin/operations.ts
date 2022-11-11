import { Operation } from 'types/store';
import SystemAPI from 'api/system';
import { AnnouncementFormData } from 'types/course/announcements';
import { UserMiniEntity } from 'types/users';
import { InstanceFormData, InstanceMiniEntity } from 'types/system/instances';
import * as actions from './actions';

/**
 * Prepares and maps announcement object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { announcement :
 *     { title, content, startAt, endAt }
 *   }
 */
const formatAnnouncementAttributes = (data: AnnouncementFormData): FormData => {
  const payload = new FormData();

  ['title', 'content', 'startAt', 'endAt'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'startAt':
          payload.append(
            'system_announcement[start_at]',
            data[field].toString(),
          );
          break;
        case 'endAt':
          payload.append('system_announcement[end_at]', data[field].toString());
          break;
        default:
          payload.append(`system_announcement[${field}]`, data[field]);
          break;
      }
    }
  });
  return payload;
};

/**
 * Prepares and maps user object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { user :
 *     { name, role }
 *   }
 */
const formatUserAttributes = (data: UserMiniEntity): FormData => {
  const payload = new FormData();

  ['name', 'role'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`user[${field}]`, data[field]);
    }
  });

  return payload;
};

/**
 * Prepares and maps instance object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { instance :
 *     { name, host }
 *   }
 */
const formatInstanceAttributes = (
  data: InstanceFormData | InstanceMiniEntity,
): FormData => {
  const payload = new FormData();

  ['name', 'host'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`instance[${field}]`, data[field]);
    }
  });

  return payload;
};

export function indexAnnouncements(): Operation<void> {
  return async (dispatch) =>
    SystemAPI.admin.indexAnnouncements().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveAnnouncementList(data.announcements, data.permissions),
      );
    });
}

export function createAnnouncement(
  formData: AnnouncementFormData,
): Operation<void> {
  const attributes = formatAnnouncementAttributes(formData);
  return async (dispatch) =>
    SystemAPI.admin.createAnnouncement(attributes).then((response) => {
      dispatch(actions.saveAnnouncement(response.data));
    });
}

export function updateAnnouncement(
  announcementId: number,
  formData: AnnouncementFormData,
): Operation<void> {
  const attributes = formatAnnouncementAttributes(formData);
  return async (dispatch) =>
    SystemAPI.admin
      .updateAnnouncement(announcementId, attributes)
      .then((response) => {
        dispatch(actions.saveAnnouncement(response.data));
      });
}

export function deleteAnnouncement(announcementId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.admin.deleteAnnouncement(announcementId).then(() => {
      dispatch(actions.deleteAnnouncement(announcementId));
    });
}

export function indexUsers(params?): Operation<void> {
  return async (dispatch) =>
    SystemAPI.admin.indexUsers(params).then((response) => {
      const data = response.data;
      dispatch(actions.saveUserList(data.users, data.counts));
    });
}

export function updateUser(
  userId: number,
  userEntity: UserMiniEntity,
): Operation<void> {
  const attributes = formatUserAttributes(userEntity);
  return async (dispatch) =>
    SystemAPI.admin.updateUser(userId, attributes).then((response) => {
      dispatch(actions.saveUser(response.data));
    });
}

export function deleteUser(userId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.admin.deleteUser(userId).then(() => {
      dispatch(actions.deleteUser(userId));
    });
}

export function indexCourses(params?): Operation<void> {
  return async (dispatch) =>
    SystemAPI.admin.indexCourses(params).then((response) => {
      const data = response.data;
      const counts = {
        totalCourses: data.totalCourses,
        activeCourses: data.activeCourses,
        coursesCount: data.coursesCount,
      };
      dispatch(actions.saveCourseList(data.courses, counts));
    });
}

export function deleteCourse(courseId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.admin.deleteCourse(courseId).then(() => {
      dispatch(actions.deleteCourse(courseId));
    });
}

export function indexInstances(params?): Operation<void> {
  return async (dispatch) =>
    SystemAPI.admin.indexInstances(params).then((response) => {
      const data = response.data;
      dispatch(
        actions.saveInstanceList(data.instances, data.permissions, data.counts),
      );
    });
}

export function createInstance(formData: InstanceFormData): Operation<void> {
  const attributes = formatInstanceAttributes(formData);
  return async (dispatch) =>
    SystemAPI.admin.createInstance(attributes).then((response) => {
      const data = response.data;
      dispatch(
        actions.saveInstanceList(data.instances, data.permissions, data.counts),
      );
    });
}

export function updateInstance(
  instanceId: number,
  instanceEntity: InstanceMiniEntity,
): Operation<void> {
  const attributes = formatInstanceAttributes(instanceEntity);
  return async (dispatch) =>
    SystemAPI.admin.updateInstance(instanceId, attributes).then((response) => {
      dispatch(actions.saveInstance(response.data));
    });
}

export function deleteInstance(instanceId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.admin.deleteInstance(instanceId).then(() => {
      dispatch(actions.deleteInstance(instanceId));
    });
}
