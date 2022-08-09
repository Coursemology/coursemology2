import { Permissions } from 'types';

export type InstancePermissions = Permissions<'canCreateInstances'>;

export type InstanceMiniEntityPermissions = Permissions<
  'canEdit' | 'canDelete'
>;

export interface InstanceBasicListData {
  id: number;
  name: string;
}

export interface InstanceListData extends InstanceBasicListData {
  host: string;
  activeUserCount: number;
  userCount: number;
  activeCourseCount: number;
  courseCount: number;
  permissions: InstanceMiniEntityPermissions;
}

export interface InstanceBasicMiniEntity {
  id: number;
  name: string;
}

export interface InstanceMiniEntity extends InstanceBasicMiniEntity {
  host: string;
  activeUserCount: number;
  userCount: number;
  activeCourseCount: number;
  courseCount: number;
  permissions: InstanceMiniEntityPermissions;
}

export interface InstanceFormData {
  name: string;
  host: string;
}
