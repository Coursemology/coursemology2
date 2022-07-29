import CourseAPI from 'api/course';
import { Operation } from 'types/store';
import {
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
  CourseUserEntity,
  CourseUserMiniEntity,
  StaffRole,
  UpdateCourseUserPatchData,
} from 'types/course/courseUsers';
import {
  PersonalTimeFormData,
  PersonalTimePostData,
} from 'types/course/personalTimes';
import * as actions from './actions';
import {
  DeletePersonalTimeAction,
  SaveUserAction,
  UpdatePersonalTimeAction,
} from './types';

/**
 * Prepares and maps object attributes to a FormData object for a PATCH request on /update.
 * Expected FormData attributes shape:
 *   { course_user :
 *     { name, phantom, role, timeline_algorithm }
 *   }
 */
const formatUpdateUser = (
  data: CourseUserEntity | CourseUserMiniEntity,
): UpdateCourseUserPatchData => {
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

const formatUpdatePersonalTime = (data: PersonalTimeFormData): FormData => {
  const payload: PersonalTimePostData = {
    personal_time: {
      lesson_plan_item_id: data.id,
      fixed: data.fixed,
      start_at: data.startAt,
      bonus_end_at: data.bonusEndAt,
      end_at: data.endAt,
    },
  };

  const formData = new FormData();
  Object.keys(payload.personal_time).forEach((key) => {
    formData.append(`personal_time[${key}]`, payload.personal_time[key]);
  });
  return formData;
};

export function fetchUsers(asBasicData: boolean = false): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users
      .index(asBasicData)
      .then((response) => {
        const data = response.data;
        if (data.userOptions && data.userOptions.length > 0) {
          dispatch(
            actions.saveManageUsersList(
              data.users,
              data.permissions!,
              data.manageCourseUsersData!,
              data.userOptions,
            ),
          );
        } else {
          dispatch(actions.saveUsersList(data.users, data.permissions!));
        }
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
          actions.saveManageUsersList(
            data.users,
            data.permissions,
            data.manageCourseUsersData,
          ),
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
          actions.saveManageUsersList(
            data.users,
            data.permissions,
            data.manageCourseUsersData,
            data.userOptions,
          ),
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
  data: CourseUserEntity | CourseUserMiniEntity,
): Operation<void> {
  const attributes = formatUpdateUser(data);
  return async (dispatch) =>
    CourseAPI.users
      .update(userId, attributes)
      .then((response) => {
        // if we are downgrading to student, we'll also need to add this student back to userOptions
        if (data.role === 'student') {
          const userOption: CourseUserBasicListData = {
            id: response.data.id,
            name: response.data.name,
          };
          dispatch(actions.updateUserOption(userOption));
        }
        dispatch(actions.saveUser(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function upgradeToStaff(
  users: CourseUserBasicMiniEntity[],
  role: StaffRole,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users
      .upgradeToStaff(users, role)
      .then((response) => {
        response.data.users.forEach((user) => {
          dispatch(actions.deleteUserOption(user.id));
          dispatch(actions.saveUser(user));
        });
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteUser(userId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users
      .delete(userId)
      .then(() => {
        dispatch(actions.deleteUser(userId));
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchPersonalTimes(userId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.personalTimes
      .index(userId)
      .then((response) => {
        dispatch(actions.savePersonalTimesList(response.data.personalTimes));
      })
      .catch((error) => {
        throw error;
      });
}

export function recomputePersonalTimes(userId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.personalTimes.recompute(userId).then((response) => {
      dispatch(actions.savePersonalTimesList(response.data.personalTimes));
    });
}

export function updatePersonalTime(
  data: PersonalTimeFormData,
  userId: number,
): Operation<UpdatePersonalTimeAction> {
  const formData = formatUpdatePersonalTime(data);

  return async (dispatch) =>
    CourseAPI.personalTimes
      .update(formData, userId)
      .then((response) => dispatch(actions.updatePersonalTime(response.data)));
}

export function deletePersonalTime(
  personalTimeId: number,
  userId: number,
): Operation<DeletePersonalTimeAction> {
  return async (dispatch) =>
    CourseAPI.personalTimes
      .delete(personalTimeId, userId)
      .then(() => dispatch(actions.deletePersonalTime(personalTimeId)))
      .catch((error) => {
        throw error;
      });
}
