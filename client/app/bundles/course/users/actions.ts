import { CourseUserData, CourseUserListData } from 'types/course/course_users';
import {
  SAVE_USER,
  SAVE_USERS_LIST,
  SaveUserAction,
  SaveUsersListAction,
} from './types';

export function saveUsersList(
  userList: CourseUserListData[],
): SaveUsersListAction {
  return {
    type: SAVE_USERS_LIST,
    userList,
  };
}

export function saveUser(user: CourseUserData): SaveUserAction {
  return {
    type: SAVE_USER,
    user,
  };
}
