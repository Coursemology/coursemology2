import {
  UserEntity,
  UserMiniEntity,
  UserListData,
  UserPermissions,
} from 'types/course/users';
import { EntityStore } from 'types/store';

// Action Names

export const SOMETHING_USERS_LIST = 'course/users/USERS_LIST';
export const SAVE_USERS_LIST = 'course/users/SAVE_USERS_LIST';

// Action Types

export interface SaveUsersListAction {
    type: typeof SAVE_USERS_LIST;
    userList: UserListData[];
    userPermissions: UserPermissions;
  }

export interface SomethingUsersListAction {
  type: typeof SOMETHING_USERS_LIST;
  userList: UserListData[];
  userPermissions: UserPermissions;
}

// State Types

export interface UsersState {
  permissions: UserPermissions;
  users: EntityStore<UserMiniEntity, UserEntity>;
  //   permissions: UsersPermissions | null;
}

export type UsersActionType =
    | SaveUsersListAction
    | SomethingUsersListAction;