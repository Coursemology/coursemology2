export const INSTANCE_STAFF_ROLES = ['instructor', 'administrator'] as const;

export const INSTANCE_USER_ROLES = ['normal', ...INSTANCE_STAFF_ROLES] as const;

export type InstanceUserRoles = (typeof INSTANCE_USER_ROLES)[number];

export type RoleRequestRoles = (typeof INSTANCE_STAFF_ROLES)[number];

export interface InstanceUserListData {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: InstanceUserRoles;
  courses: {
    id: number;
    title: string;
  }[];
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
  role: InstanceUserRoles;
  courses: {
    id: number;
    title: string;
  }[];
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
