import {
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
  CourseUserEntity,
  CourseUserMiniEntity,
  StaffRole,
  UpdateCourseUserPatchData,
} from 'types/course/courseUsers';
import {
  ExperiencePointsRowData,
  UpdateExperiencePointsRecordPatchData,
} from 'types/course/experiencePointsRecords';
import {
  PersonalTimeFormData,
  PersonalTimePostData,
} from 'types/course/personalTimes';
import { TimelineData } from 'types/course/referenceTimelines';
import { Operation } from 'types/store';

import CourseAPI from 'api/course';

import * as actions from './actions';
import {
  DeleteExperiencePointsRecordAction,
  DeletePersonalTimeAction,
  SaveUserAction,
  UpdateExperiencePointsRecordAction,
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
  data: CourseUserEntity | Partial<CourseUserMiniEntity>,
): UpdateCourseUserPatchData => {
  return {
    course_user: {
      name: data.name,
      phantom: data.phantom,
      role: data.role,
      reference_timeline_id: data.referenceTimelineId,
      timeline_algorithm: data.timelineAlgorithm,
    },
  };
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

const formatUpdateExperiencePointsRecord = (
  data: ExperiencePointsRowData,
): UpdateExperiencePointsRecordPatchData => {
  return {
    experience_points_record: {
      reason: data.reason ? data.reason.trim() : data.reason,
      points_awarded: parseInt(data.pointsAwarded.toString(), 10),
    },
  };
};

export function fetchUsers(asBasicData: boolean = false): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users.index(asBasicData).then((response) => {
      const data = response.data;
      if (data.userOptions && data.userOptions.length > 0) {
        dispatch(
          actions.saveManageUserList(
            data.users,
            data.permissions!,
            data.manageCourseUsersData!,
            data.userOptions,
          ),
        );
      } else {
        dispatch(actions.saveUserList(data.users, data.permissions!));
      }
    });
}

export function fetchStudents(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users.indexStudents().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveManageUserList(
          data.users,
          data.permissions,
          data.manageCourseUsersData,
          [],
          data.timelines,
        ),
      );
    });
}

export function fetchStaff(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users.indexStaff().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveManageUserList(
          data.users,
          data.permissions,
          data.manageCourseUsersData,
          data.userOptions,
        ),
      );
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
  data: CourseUserEntity | Partial<CourseUserMiniEntity>,
): Operation<void> {
  const attributes = formatUpdateUser(data);
  return async (dispatch) =>
    CourseAPI.users.update(userId, attributes).then((response) => {
      // if we are downgrading to student, we'll also need to add this student back to userOptions
      if (data.role === 'student') {
        const userOption: CourseUserBasicListData = {
          id: response.data.id,
          name: response.data.name,
        };
        dispatch(actions.updateUserOption(userOption));
      }

      // TODO: Fix `actions.saveUser`'s params to support handling `CourseUserMiniEntity`.
      // This should trigger a TypeScript type mismatch because `response.data` could be
      // of type `CourseUserMiniEntity`, but `actions.saveUser` only accepts `CourseUserData`.
      dispatch(actions.saveUser(response.data));
    });
}

export function upgradeToStaff(
  users: CourseUserBasicMiniEntity[],
  role: StaffRole,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users.upgradeToStaff(users, role).then((response) => {
      response.data.users.forEach((user) => {
        dispatch(actions.deleteUserOption(user.id));
        dispatch(actions.saveUser(user));
      });
    });
}

export function assignToTimeline(
  ids: CourseUserBasicMiniEntity['id'][],
  timelineId: TimelineData['id'],
): Operation<void> {
  return async (dispatch) => {
    await CourseAPI.users.assignToTimeline(ids, timelineId);
    ids.forEach((id) => {
      // @ts-ignore: ignore type mismatch between this object and `CourseUserData`
      // TODO: Fix `actions.saveUser`'s params to support handling `CourseUserMiniEntity`.
      // The dispatch in `updateUser` above technically should also fire the same error.
      // The only reason it does not is because the `response` is not typed, and thus
      // its `response.data` is `any`, thus is assignable to `CourseUserData`.
      //
      // This line still technically works because `saveEntityToStore` thankfully
      // intelligently merges the old and new entities.
      dispatch(actions.saveUser({ id, referenceTimelineId: timelineId }));
    });
  };
}

export function deleteUser(userId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.users.delete(userId).then(() => {
      dispatch(actions.deleteUser(userId));
    });
}

export function fetchPersonalTimes(userId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.personalTimes.index(userId).then((response) => {
      dispatch(actions.savePersonalTimeList(response.data.personalTimes));
    });
}

export function recomputePersonalTimes(userId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.personalTimes.recompute(userId).then((response) => {
      dispatch(actions.savePersonalTimeList(response.data.personalTimes));
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
      .then(() => dispatch(actions.deletePersonalTime(personalTimeId)));
}

export function fetchExperiencePointsRecord(
  userId: number,
  pageNum: number = 1,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.experiencePointsRecord.index(userId, pageNum).then((response) => {
      const data = response.data;
      dispatch(
        actions.saveExperiencePointsRecordList(
          data.courseUserName,
          data.rowCount,
          data.experiencePointRecords,
        ),
      );
    });
}

export function updateExperiencePointsRecord(
  data: ExperiencePointsRowData,
): Operation<UpdateExperiencePointsRecordAction> {
  const params: UpdateExperiencePointsRecordPatchData =
    formatUpdateExperiencePointsRecord(data);

  return async (dispatch) =>
    CourseAPI.experiencePointsRecord
      .update(params, data.id)
      .then((response) =>
        dispatch(actions.updateExperiencePointsRecord(response.data)),
      );
}

export function deleteExperiencePointsRecord(
  recordId: number,
): Operation<DeleteExperiencePointsRecordAction> {
  return async (dispatch) =>
    CourseAPI.experiencePointsRecord
      .delete(recordId)
      .then(() => dispatch(actions.deleteExperiencePointsRecord(recordId)));
}
