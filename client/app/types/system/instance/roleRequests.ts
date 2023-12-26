import { RoleRequestRoles } from './users';

export interface RoleRequestBasicListData {
  id: number;
  role: RoleRequestRoles;
  organization: string;
  designation: string;
  reason: string;
}

export interface RoleRequestListData extends RoleRequestBasicListData {
  name: string;
  email: string;
  status: string;
  createdAt: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
  rejectionMessage?: string;
}

export interface RoleRequestMiniEntity extends RoleRequestBasicListData {
  name: string;
  email: string;
  status: string;
  createdAt: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
  rejectionMessage?: string;
}

/**
 * Row data from InstanceUserRoleRequests Datatable
 */
export interface RoleRequestRowData extends RoleRequestMiniEntity {
  'S/N'?: number;
  actions?: undefined;
}

export interface UserRoleRequestForm {
  role: RoleRequestRoles;
  organization: string;
  designation: string;
  reason: string;
}
