export interface InvitationFileEntity {
  name: string;
  url: string;
  file?: Blob;
}

export interface InvitationMessage {
  success?: string;
  warning?: string;
}

export interface IndividualInvites {
  invitations: IndividualInviteRowData[];
}
export interface IndividualInviteRowData {
  id?: string;
  name: string;
  email: string;
  role: string;
  phantom: boolean;
  timelineAlgorithm?: string;
}

/**
 * Data types for POST invitation via /users/invite
 */
export interface InvitationPostData {
  id?: string | undefined;
  name: string;
  email: string;
  role: string;
  phantom: boolean;
  timelineAlgorithm?: string | undefined;
}

export interface InvitationsPostData {
  invitations: {
    id?: string | undefined;
    name: string;
    email: string;
    role: string;
    phantom: boolean;
    timelineAlgorithm?: string | undefined;
  }[];
}

export interface InvitationEntity {
  id: number;
  name: string;
  email: string;
  role: string;
  phantom: boolean;
  invitationKey: string;
  confirmed: boolean;
  sentAt?: string;
  resendInvitationUrl?: string;
  confirmedAt?: string;
}

export interface InvitationData {
  id: number;
  name: string;
  email: string;
  role: string;
  phantom: boolean;
  invitationKey: string;
  confirmed: boolean;
  sentAt?: string;
  resendInvitationUrl?: string;
  confirmedAt?: string;
}
