import { Roles } from 'types';

export type UserRoles = Roles<'normal' | 'administrator'>;
export type UserRole = keyof UserRoles;

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
  totalCourses: number;
  activeCourses: number;
}
