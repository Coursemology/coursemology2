import { Permissions } from 'types';

import { InstanceUserRoles } from './instance/users';

export type InstancePermissions = Permissions<
  'canCreateInstances' | 'canCreateAnnouncement'
>;

export type InstanceMiniEntityPermissions = Permissions<
  'canEdit' | 'canDelete'
>;

export interface InstanceBasicListData {
  id: number;
  name: string;
  host: string;
  redirectUri: string;
  instanceRole?: InstanceUserRoles;
}

export interface InstanceListData extends InstanceBasicListData {
  activeUserCount: number;
  userCount: number;
  activeCourseCount: number;
  courseCount: number;
  permissions: InstanceMiniEntityPermissions;
}

export interface InstanceBasicMiniEntity {
  id: number;
  name: string;
  host: string;
  redirectUri: string;
  instanceRole?: InstanceUserRoles;
}

export interface InstanceMiniEntity extends InstanceBasicMiniEntity {
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
