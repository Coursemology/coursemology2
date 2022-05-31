import { Permissions } from 'types';
import { CourseUserData, CourseUserEntity } from './course_users';

export type UserPermissions = Permissions<
  'canCreate' | 'canManage' | 'canReorder'
>;

/**
 * Data types for achievement data retrieved from backend through API call.
 */

export interface UserListData {
  id: number;
  userName: string;
  userLink: string;
  userImageUrl: string;

  //   permissions: UserListDataPermissions;
}

export interface UserData extends CourseUserData {}

export interface UserMiniEntity {
  id: number;
  userName: string;
  userLink: string;
  userImageUrl: string;
}

export interface UserEntity extends CourseUserEntity {
    userName: string;
    userLink: string;
    userImageUrl: string;
}
