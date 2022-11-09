import {
  CourseUserBasicListData,
  CourseUserData,
  CourseUserListData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { ExperiencePointsRecordListData } from 'types/course/experiencePointsRecords';
import { PersonalTimeListData } from 'types/course/personalTimes';

import {
  DELETE_EXPERIENCE_POINTS_RECORD,
  DELETE_PERSONAL_TIME,
  DELETE_USER,
  DELETE_USER_OPTION,
  DeleteExperiencePointsRecordAction,
  DeletePersonalTimeAction,
  DeleteUserAction,
  DeleteUserOptionAction,
  SAVE_EXPERIENCE_POINTS_RECORD_LIST,
  SAVE_MANAGE_USER_LIST,
  SAVE_PERSONAL_TIME_LIST,
  SAVE_USER,
  SAVE_USER_LIST,
  SaveExperiencePointsRecordListAction,
  SaveManageUserListAction,
  SavePersonalTimeListAction,
  SaveUserAction,
  SaveUserListAction,
  UPDATE_EXPERIENCE_POINTS_RECORD,
  UPDATE_PERSONAL_TIME,
  UPDATE_USER_OPTION,
  UpdateExperiencePointsRecordAction,
  UpdatePersonalTimeAction,
  UpdateUserOptionAction,
} from './types';

export function saveUserList(
  userList: CourseUserListData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
): SaveUserListAction {
  return {
    type: SAVE_USER_LIST,
    userList,
    manageCourseUsersPermissions,
  };
}

export function saveManageUserList(
  userList: CourseUserListData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
  manageCourseUsersData: ManageCourseUsersSharedData,
  userOptions: CourseUserBasicListData[] = [],
): SaveManageUserListAction {
  return {
    type: SAVE_MANAGE_USER_LIST,
    userList,
    manageCourseUsersPermissions,
    manageCourseUsersData,
    userOptions,
  };
}

export function deleteUser(userId: number): DeleteUserAction {
  return {
    type: DELETE_USER,
    userId,
  };
}

export function saveUser(user: CourseUserData): SaveUserAction {
  return {
    type: SAVE_USER,
    user,
  };
}

export function savePersonalTimeList(
  personalTimes: PersonalTimeListData[],
): SavePersonalTimeListAction {
  return {
    type: SAVE_PERSONAL_TIME_LIST,
    personalTimes,
  };
}

export function updatePersonalTime(
  personalTime: PersonalTimeListData,
): UpdatePersonalTimeAction {
  return {
    type: UPDATE_PERSONAL_TIME,
    personalTime,
  };
}

export function deletePersonalTime(
  personalTimeId: number,
): DeletePersonalTimeAction {
  return {
    type: DELETE_PERSONAL_TIME,
    personalTimeId,
  };
}

export function updateUserOption(
  userOption: CourseUserBasicListData,
): UpdateUserOptionAction {
  return {
    type: UPDATE_USER_OPTION,
    userOption,
  };
}

export function deleteUserOption(id: number): DeleteUserOptionAction {
  return {
    type: DELETE_USER_OPTION,
    id,
  };
}

export function saveExperiencePointsRecordList(
  courseUserName: string,
  rowCount: number,
  experiencePointRecords: ExperiencePointsRecordListData[],
): SaveExperiencePointsRecordListAction {
  return {
    type: SAVE_EXPERIENCE_POINTS_RECORD_LIST,
    courseUserName,
    rowCount,
    experiencePointRecords,
  };
}

export function updateExperiencePointsRecord(
  data: ExperiencePointsRecordListData,
): UpdateExperiencePointsRecordAction {
  return {
    type: UPDATE_EXPERIENCE_POINTS_RECORD,
    data,
  };
}

export function deleteExperiencePointsRecord(
  id: number,
): DeleteExperiencePointsRecordAction {
  return {
    type: DELETE_EXPERIENCE_POINTS_RECORD,
    id,
  };
}
