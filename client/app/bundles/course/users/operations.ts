import CourseAPI from 'api/course';
import { Operation } from 'types/store';
import {
  CourseUserData,
  UpdateCourseUserPatchData,
} from 'types/course/course_users';
import * as actions from './actions';
import { SaveUserAction } from './types';

/**
 * Prepares and maps object attributes to a FormData object for a PATCH request on /update.
 * Expected FormData attributes shape:
 *   { course_user :
 *     { name, phantom, role, timeline_algorithm }
 *   }
 */
const formatAttributes = (data: CourseUserData): UpdateCourseUserPatchData => {
  const payload = {
    course_user: {
      name: data.name,
      phantom: data.phantom,
      role: data.role,
      timeline_algorithm: data.timelineAlgorithm,
    },
  };

  return payload;
};

export function fetchUsers(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users
      .index()
      .then((response) => {
        const data = response.data;
        dispatch(actions.saveUsersList(data.users));
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchStudents(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users
      .indexStudents()
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveUsersListWithPermissions(data.users, data.permissions),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchStaff(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users
      .indexStaff()
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveUsersListWithPermissions(data.users, data.permissions),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function loadUser(userId: number): Operation<SaveUserAction> {
  return async (dispatch) =>
    CourseAPI.users
      .fetch(userId)
      .then((response) => dispatch(actions.saveUser(response.data.user)));
}

export function updateUser(
  userId: number,
  data: CourseUserData,
): Operation<void> {
  const attributes = formatAttributes(data);
  return async (dispatch) =>
    CourseAPI.users.update(userId, attributes).then((response) => {
      dispatch(actions.saveUser(response.data.user));
    });
}

export function upgradeToStaff(userId: number, role: string): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users.upgradeToStaff(userId, role).then((response) => {
      dispatch(actions.saveUser(response.data.user));
    });
}

export function deleteUser(userId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users.delete(userId).then(() => {
      dispatch(actions.deleteUser(userId));
    });
}
