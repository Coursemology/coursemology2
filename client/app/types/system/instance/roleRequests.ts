import { RoleRequestRole } from './users';

export interface RoleRequestListData {
  id: number;
  name: string;
  email: string;
  organization: string;
  designation: string;
  role: RoleRequestRole;
  reason: string;
  status: string;
  createdAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectionMessage?: string;
}

export interface RoleRequestMiniEntity {
  id: number;
  name: string;
  email: string;
  organization: string;
  designation: string;
  role: RoleRequestRole;
  reason: string;
  status: string;
  createdAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectionMessage?: string;
}

/**
 * Row data from InstanceUserRoleRequests Datatable
 */
export interface RoleRequestRowData extends RoleRequestMiniEntity {
  'S/N'?: number;
  actions?: undefined;
}
