import { Roles } from 'types';
import { CourseUserRole } from './course/courseUsers';

export type UserRoles = Roles<'normal' | 'administrator'>;
export type UserRole = keyof UserRoles;

export interface UserBasicListData {
  id: number;
  name: string;
  imageUrl?: string;
}
export interface UserListData {
  id: number;
  name: string;
  email: string;
  instances: {
    name: string;
    host: string;
  }[];
  role: UserRole;
  canMasquerade?: boolean;
  masqueradePath?: string;
}

export interface UserBasicMiniEntity {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface UserMiniEntity extends UserBasicMiniEntity {
  email: string;
  instances: {
    name: string;
    host: string;
  }[];
  role: UserRole;
  canMasquerade?: boolean;
  masqueradePath?: string;
}

export interface UserCourseListData {
  id: number;
  title: string;
  createdAt: string;
  userCount: number;
  courseUserId: number;
  courseUserName: string;
  courseUserRole: CourseUserRole;
  courseUserAchievement: number;
  courseUserLevel: number;
  type: string;
}

export interface UserCourseMiniEntity {
  id: number;
  title: string;
  createdAt: string;
  userCount: number;
  courseUserId: number;
  courseUserName: string;
  courseUserRole: CourseUserRole;
  courseUserAchievement: number;
  courseUserLevel: number;
  type: string;
}

export interface AdminStats {
  totalUsers: {
    adminCount?: number;
    normalCount?: number;
    allCount: number;
  };
  activeUsers: {
    adminCount?: number;
    normalCount?: number;
    allCount: number;
  };
  coursesCount: number;
  usersCount: number;
  totalCourses: number;
  activeCourses: number;
  instancesCount: number;
}
