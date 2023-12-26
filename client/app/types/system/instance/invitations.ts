import { InstanceUserListData, InstanceUserRoles } from './users';

export interface IndividualInvites {
  invitations: IndividualInvite[];
}
export interface IndividualInvite {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export interface InvitationResult {
  duplicateUsers?: InstanceUserListData[];
  existingInstanceUsers?: InstanceUserListData[];
  existingInvitations?: InvitationListData[];
  newInstanceUsers?: InstanceUserListData[];
  newInvitations?: InvitationListData[];
}

export interface InvitationMiniEntity {
  id: number;
  name: string;
  email: string;
  confirmed: boolean;
  role: InstanceUserRoles;
  invitationKey: string;
  sentAt: string | null;
  confirmedAt: string | null;
}

export interface InvitationListData {
  id: number;
  name: string;
  email: string;
  confirmed: boolean;
  role: InstanceUserRoles;
  invitationKey: string;
  sentAt: string | null;
  confirmedAt: string | null;
}

/**
 * Row data from UserInvitationsTable Datatable
 */
export interface InvitationRowData extends InvitationMiniEntity {
  'S/N'?: number;
  actions?: undefined;
}

export interface InvitationPostData {
  id?: string | undefined;
  name: string;
  email: string;
  role: string;
}

export interface InvitationsPostData {
  invitations: {
    id?: string | undefined;
    name: string;
    email: string;
    role: string;
  }[];
}
