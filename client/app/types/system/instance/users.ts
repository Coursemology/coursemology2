import { Roles } from 'types';

export type InstanceUserRoles = Roles<
  'normal' | 'administrator' | 'instructor'
>;
export type InstanceUserRole = keyof InstanceUserRoles;

export type RoleRequestRoles = Roles<'administrator' | 'instructor'>;
export type RoleRequestRole = keyof RoleRequestRoles;

export interface InstanceUserListData {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: InstanceUserRole;
  courses: number;
}

export interface InstanceUserBasicListData {
  id: number;
  userId: string;
  name: string;
}

export interface InstanceUserBasicPhotoListData
  extends InstanceUserBasicListData {
  imageUrl: string;
}

export interface InstanceUserBasicMiniEntity {
  id: number;
  userId: string;
  name: string;
}

export interface InstanceUserBasicPhotoMiniEntity
  extends InstanceUserBasicMiniEntity {
  imageUrl: string;
}

export interface InstanceUserMiniEntity extends InstanceUserBasicMiniEntity {
  email: string;
  role: InstanceUserRole;
  courses: number;
}

export interface InstanceAdminStats {
  totalUsers: {
    adminCount?: number;
    instructorCount?: number;
    normalCount?: number;
    allCount: number;
  };
  activeUsers: {
    adminCount?: number;
    instructorCount?: number;
    normalCount?: number;
    allCount: number;
  };
  coursesCount: number;
  usersCount: number;
  totalCourses: number;
  activeCourses: number;
}
