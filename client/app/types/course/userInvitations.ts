import {
  CourseUserData,
  CourseUserListData,
  CourseUserRole,
} from './courseUsers';
import { TimelineAlgorithm } from './personalTimes';

export interface InvitationFileEntity {
  name: string;
  url: string;
  file?: Blob;
}

export type DuplicateReason =
  | 'duplicate_email_in_file'
  | 'duplicate_external_id_in_file'
  | 'external_id_taken';

export interface DuplicateUserData extends CourseUserListData {
  reason?: DuplicateReason;
}

export interface InvitationResult {
  duplicateUsers?: DuplicateUserData[];
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
  externalId?: string;
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
  externalId?: string | null;
  role: string;
  phantom: boolean;
  timelineAlgorithm?: string | undefined;
}

export interface InvitationsPostData {
  invitations: {
    id?: string | undefined;
    name: string;
    email: string;
    externalId?: string | null;
    role: string;
    phantom: boolean;
    timelineAlgorithm?: string | undefined;
  }[];
}

export interface InvitationMiniEntity {
  id: number;
  name: string;
  email: string;
  externalId: string | null;
  role: CourseUserRole;
  phantom: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
  invitationKey: string;
  confirmed: boolean;
  sentAt: string | null;
  confirmedAt: string | null;
  isRetryable: boolean;
}

export interface InvitationListData {
  id: number;
  name: string;
  email: string;
  externalId: string | null;
  role: CourseUserRole;
  phantom: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
  invitationKey: string;
  confirmed: boolean;
  sentAt: string | null;
  confirmedAt: string | null;
  isRetryable: boolean;
}

export type InvitationStatus = 'pending' | 'accepted' | 'failed';
