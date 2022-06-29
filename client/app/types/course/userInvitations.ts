import { CourseUserData } from './courseUsers';

export interface InvitationFileEntity {
  name: string;
  url: string;
  file?: Blob;
}

export interface InvitationResult {
  duplicateUsers?: CourseUserData[];
  existingCourseUsers?: CourseUserData[];
  existingInvitations?: InvitationListData[];
  newCourseUsers?: CourseUserData[];
  newInvitations?: InvitationListData[];
}

export interface IndividualInvites {
  invitations: IndividualInvite[];
}
export interface IndividualInvite {
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

export interface InvitationMiniEntity {
  id: number;
  name: string;
  email: string;
  role: string;
  phantom: boolean;
  invitationKey: string;
  confirmed: boolean;
  sentAt?: string;
  confirmedAt?: string;
}

export interface InvitationListData {
  id: number;
  name: string;
  email: string;
  role: string;
  phantom: boolean;
  invitationKey: string;
  confirmed: boolean;
  sentAt?: string;
  confirmedAt?: string;
}

/**
 * Row data from UserInvitationsTable Datatable
 */
export interface InvitationRowData extends InvitationMiniEntity {
  'S/N'?: number;
  actions?: undefined;
}
