import { UserData, UserListData, UserPermissions } from 'types/course/users';
import {
  SAVE_USER,
  SAVE_USERS_LIST,
  SaveUserAction,
  SaveUsersListAction,
} from './types';

export function saveUser(user: UserData): SaveUserAction {
  return {
    type: SAVE_USER,
    user,
  };
}

export function saveUsersList(
  userList: UserListData[],
  userPermissions: UserPermissions,
): SaveUsersListAction {
  return {
    type: SAVE_USERS_LIST,
    userList,
    userPermissions,
  };
}
