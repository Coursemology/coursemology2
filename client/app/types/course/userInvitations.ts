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
