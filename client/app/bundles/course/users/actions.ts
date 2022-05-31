import {
  // UserData,
  UserListData,
  UserPermissions,
} from 'types/course/users';
import {
  SOMETHING_USERS_LIST,
  SAVE_USERS_LIST,
  SaveUsersListAction,
  SomethingUsersListAction,
} from './types';

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

export function somethingUsersList(
  userList: UserListData[],
  userPermissions: UserPermissions,
): SomethingUsersListAction {
  return {
    type: SOMETHING_USERS_LIST,
    userList,
    userPermissions,
  };
}
