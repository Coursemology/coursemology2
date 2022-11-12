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

export interface ProfileData {
  id: string;
  name: string;
  timezone: string;
  imageUrl: string;
}

export interface EmailData {
  id: number;
  email: string;
  isConfirmed: boolean;
  isPrimary: boolean;
  confirmationEmailPath?: string;
  setPrimaryUserEmailPath?: string;
}

export interface EmailsData {
  emails: EmailData[];
}

export interface PasswordData {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export interface ProfilePostData {
  user: {
    name?: ProfileData['name'];
    time_zone?: ProfileData['timezone'];
    profile_photo?: ProfileData['imageUrl'];
  };
}

export interface EmailPostData {
  user_email: {
    email?: EmailData['email'];
  };
}

export interface PasswordPostData {
  user: {
    current_password?: PasswordData['currentPassword'];
    password?: PasswordData['password'];
    password_confirmation?: PasswordData['passwordConfirmation'];
  };
}
