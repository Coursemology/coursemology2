import {
  UserEntity,
  UserMiniEntity,
  UserListData,
  UserPermissions,
  UserData,
} from 'types/course/users';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_USER = 'course/users/SAVE_USER';
export const SAVE_USERS_LIST = 'course/users/SAVE_USERS_LIST';

// Action Types
export interface SaveUsersListAction {
  type: typeof SAVE_USERS_LIST;
  userList: UserListData[];
  userPermissions: UserPermissions;
}

export interface SaveUserAction {
  type: typeof SAVE_USER;
  user: UserData;
}

// State Types

export interface UsersState {
  permissions: UserPermissions;
  users: EntityStore<UserMiniEntity, UserEntity>;
}

export type UsersActionType = SaveUsersListAction | SaveUserAction;
