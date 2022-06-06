import { Permissions } from 'types';

export type CoursePermissions = Permissions<'canCreate'>;

export type CourseListPermissions = Permissions<'canCreate'>;

export interface CourseMiniEntity {
  id: number;
  title: string;
  description: string;
  logoURL: string;
}

export interface CourseListData {
  id: number;
  title: string;
  description: string;
  logoURL: string;
  instanceUserRoleRequestId: number;
  permissions: CourseListPermissions;
}

export interface NewCourseFormData {
  title: string;
  description: string;
}
