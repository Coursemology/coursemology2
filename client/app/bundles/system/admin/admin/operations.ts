import { Operation } from 'types/store';
import CourseAPI from 'api/course';
import { AnnouncementFormData } from 'types/system/announcements';
import { UserMiniEntity } from 'types/users';
import { InstanceFormData, InstanceMiniEntity } from 'types/system/instances';
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

  ['title', 'content', 'startAt', 'endAt'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'startAt':
          payload.append('system_announcement[start_at]', data[field]);
          break;
        case 'endAt':
          payload.append('system_announcement[end_at]', data[field]);
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
    CourseAPI.admin.system
      .indexAnnouncements()
      .then((response) => {
        const data = response.data;
        dispatch(actions.saveAnnouncementsList(data.announcements));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteAnnouncement(announcementId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.admin.system.deleteAnnouncement(announcementId).then(() => {
      dispatch(actions.deleteAnnouncement(announcementId));
    });
}

export function updateAnnouncement(
  announcementId: number,
  formData: AnnouncementFormData,
): Operation<void> {
  const attributes = formatAnnouncementAttributes(formData);
  return async (dispatch) =>
    CourseAPI.admin.system
      .updateAnnouncement(announcementId, attributes)
      .then((response) => {
        dispatch(actions.saveAnnouncement(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function createAnnouncement(
  formData: AnnouncementFormData,
): Operation<void> {
  const attributes = formatAnnouncementAttributes(formData);
  return async (dispatch) =>
    CourseAPI.admin.system
      .createAnnouncement(attributes)
      .then((response) => {
        dispatch(actions.saveAnnouncement(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function indexUsers(params?): Operation<void> {
  return async (dispatch) =>
    CourseAPI.admin.system
      .indexUsers(params)
      .then((response) => {
        const data = response.data;
        dispatch(actions.saveUsersList(data.users, data.counts));
      })
      .catch((error) => {
        throw error;
      });
}

export function updateUser(
  userId: number,
  userEntity: UserMiniEntity,
): Operation<void> {
  const attributes = formatUserAttributes(userEntity);
  return async (dispatch) =>
    CourseAPI.admin.system
      .updateUser(userId, attributes)
      .then((response) => {
        dispatch(actions.saveUser(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteUser(userId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.admin.system.deleteUser(userId).then(() => {
      dispatch(actions.deleteUser(userId));
    });
}

export function indexCourses(params?): Operation<void> {
  return async (dispatch) =>
    CourseAPI.admin.system
      .indexCourses(params)
      .then((response) => {
        const data = response.data;
        const counts = {
          totalCourses: data.totalCourses,
          activeCourses: data.activeCourses,
          searchCount: data.searchCount,
        };
        dispatch(actions.saveCourseList(data.courses, counts));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteCourse(courseId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.admin.system.deleteCourse(courseId).then(() => {
      dispatch(actions.deleteCourse(courseId));
    });
}

export function indexInstances(params?): Operation<void> {
  return async (dispatch) =>
    CourseAPI.admin.system
      .indexInstances(params)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveInstanceList(
            data.instances,
            data.permissions,
            data.counts,
          ),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function createInstance(formData: InstanceFormData): Operation<void> {
  const attributes = formatInstanceAttributes(formData);
  return async (dispatch) =>
    CourseAPI.admin.system
      .createInstance(attributes)
      .then((response) => {
        dispatch(actions.saveInstance(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function updateInstance(
  instanceId: number,
  instanceEntity: InstanceMiniEntity,
): Operation<void> {
  const attributes = formatInstanceAttributes(instanceEntity);
  return async (dispatch) =>
    CourseAPI.admin.system
      .updateInstance(instanceId, attributes)
      .then((response) => {
        dispatch(actions.saveInstance(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteInstance(instanceId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.admin.system.deleteInstance(instanceId).then(() => {
      dispatch(actions.deleteInstance(instanceId));
    });
}
