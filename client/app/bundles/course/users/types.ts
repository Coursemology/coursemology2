import {
  CourseUserEntity,
  CourseUserMiniEntity,
  CourseUserListData,
  CourseUserData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
  CourseUserBasicMiniEntity,
  CourseUserBasicListData,
} from 'types/course/courseUsers';
import {
  ExperiencePointsRecordListData,
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRecordSettings,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';
import {
  PersonalTimeListData,
  PersonalTimeMiniEntity,
} from 'types/course/personalTimes';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_USERS_LIST = 'course/users/SAVE_USERS_LIST';
export const SAVE_USER = 'course/users/SAVE_USER';
export const SAVE_MANAGE_USERS_LIST = 'course/users/SAVE_MANAGE_USERS_LIST';
export const DELETE_USER = 'course/users/DELETE_USER';
export const SAVE_PERSONAL_TIMES_LIST = 'course/users/SAVE_PERSONAL_TIMES_LIST';
export const UPDATE_PERSONAL_TIME = 'course/users/UPDATE_PERSONAL_TIME';
export const DELETE_PERSONAL_TIME = 'course/users/DELETE_PERSONAL_TIME';
export const UPDATE_USER_OPTION = 'course/users/UPDATE_USER_OPTION';
export const DELETE_USER_OPTION = 'course/users/DELETE_USER_OPTION';
export const SAVE_EXPERIENCE_POINTS_RECORD_LIST =
  'course/users/SAVE_EXPERIENCE_POINTS_RECORD_LIST';
export const UPDATE_EXPERIENCE_POINTS_RECORD =
  'course/users/UPDATE_EXPERIENCE_POINTS_RECORD';
export const DELETE_EXPERIENCE_POINTS_RECORD =
  'course/users/DELETE_EXPERIENCE_POINTS_RECORD';

// Action Types
export interface SaveUsersListAction {
  type: typeof SAVE_USERS_LIST;
  userList: CourseUserListData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
}

export interface SaveUserAction {
  type: typeof SAVE_USER;
  user: CourseUserData;
}

export interface SaveManageUsersListAction {
  type: typeof SAVE_MANAGE_USERS_LIST;
  userList: CourseUserListData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
  userOptions: CourseUserBasicListData[];
}
export interface DeleteUserAction {
  type: typeof DELETE_USER;
  userId: number;
}

export interface SavePersonalTimesListAction {
  type: typeof SAVE_PERSONAL_TIMES_LIST;
  personalTimes: PersonalTimeListData[];
}
export interface UpdatePersonalTimeAction {
  type: typeof UPDATE_PERSONAL_TIME;
  personalTime: PersonalTimeListData;
}
export interface DeletePersonalTimeAction {
  type: typeof DELETE_PERSONAL_TIME;
  personalTimeId: number;
}

export interface UpdateUserOptionAction {
  type: typeof UPDATE_USER_OPTION;
  userOption: CourseUserBasicListData;
}

export interface DeleteUserOptionAction {
  type: typeof DELETE_USER_OPTION;
  id: number;
}

export interface SaveExperiencePointsRecordListAction {
  type: typeof SAVE_EXPERIENCE_POINTS_RECORD_LIST;
  name: string;
  rowCount: number;
  rowData: ExperiencePointsRecordListData[];
}

export interface UpdateExperiencePointsRecordAction {
  type: typeof UPDATE_EXPERIENCE_POINTS_RECORD;
  data: ExperiencePointsRowData;
}

export interface DeleteExperiencePointsRecordAction {
  type: typeof DELETE_EXPERIENCE_POINTS_RECORD;
  id: number;
}

export type UsersActionType =
  | SaveUsersListAction
  | SaveUserAction
  | SaveManageUsersListAction
  | DeleteUserAction
  | SavePersonalTimesListAction
  | UpdatePersonalTimeAction
  | DeletePersonalTimeAction
  | UpdateUserOptionAction
  | DeleteUserOptionAction
  | SaveExperiencePointsRecordListAction
  | UpdateExperiencePointsRecordAction
  | DeleteExperiencePointsRecordAction;

// State Types
export interface UsersState {
  users: EntityStore<CourseUserMiniEntity, CourseUserEntity>;
  userOptions: EntityStore<CourseUserBasicMiniEntity, CourseUserEntity>;
  permissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
  personalTimes: EntityStore<PersonalTimeMiniEntity, PersonalTimeMiniEntity>;
  experiencePointsRecords: EntityStore<
    ExperiencePointsRecordMiniEntity,
    ExperiencePointsRecordMiniEntity
  >;
  experiencePointsRecordsSettings: ExperiencePointsRecordSettings;
}
