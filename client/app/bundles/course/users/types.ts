import {
  CourseUserEntity,
  CourseUserMiniEntity,
  CourseUserListData,
  CourseUserData,
} from 'types/course/course_users';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_USERS_LIST = 'course/users/SAVE_USERS_LIST';
export const SAVE_USER = 'course/users/SAVE_USER';

// Action Types
export interface SaveUsersListAction {
  type: typeof SAVE_USERS_LIST;
  userList: CourseUserListData[];
}

export interface SaveUserAction {
  type: typeof SAVE_USER;
  user: CourseUserData;
}

export type UsersActionType = SaveUsersListAction | SaveUserAction;

// State Types
export interface UsersState {
  users: EntityStore<CourseUserMiniEntity, CourseUserEntity>;
}
