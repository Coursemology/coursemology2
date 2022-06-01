import { Permissions } from 'types';

export type CoursesPermissions = Permissions<'canCreate' | 'requestSubmitted'>;
export type CoursesListPermissions = Permissions<
  'canCreate' | 'requestSubmitted'
>;

export interface CoursesEntity {
  id: number;
  title: string;
  description: string;
  course: string;
  logo: string;
}

export interface CoursesListData {
  id: number;
  title: string;
  description: string;
  course: string;
  logo: string;
  permissions: CoursesListPermissions;
}

export interface NewCourseFormData {
  title: string;
  description: string;
}
