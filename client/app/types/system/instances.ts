import { Permissions } from 'types';

export type InstancePermissions = Permissions<'canCreate'>;

export interface InstanceListData {
  id: number;
  name: string;
  host: string;
  activeUserCount: number;
  userCount: number;
  activeCourseCount: number;
  courseCount: number;

  canEdit: boolean;
  canDelete: boolean;
}

export interface InstanceBasicMiniEntity {
  id: number;
  name: string;
  host: string;
}

export interface InstanceMiniEntity {
  id: number;
  name: string;
  host: string;
  activeUserCount: number;
  userCount: number;
  activeCourseCount: number;
  courseCount: number;

  canEdit: boolean;
  canDelete: boolean;
}

export interface InstanceFormData {
  name: string;
  host: string;
}
