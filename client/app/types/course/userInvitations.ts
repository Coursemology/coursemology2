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

export type InvitationFailureReason =
  | 'duplicate_email_in_file'
  | 'duplicate_external_id_in_file'
  | 'external_id_taken'
  | 'failed_to_send';

export interface FailedInvitationRowData extends CourseUserListData {
  reason: InvitationFailureReason;
  timelineAlgorithm?: TimelineAlgorithm;
}

export interface InvitationResult {
  failedUsers?: FailedInvitationRowData[];
  existingCourseUsers?: CourseUserData[];
  existingInvitations?: InvitationListData[];
  newCourseUsers?: CourseUserData[];
  newInvitations?: InvitationListData[];
  updatedCourseUsers?: InvitationUpdatedItem[];
  updatedInvitations?: InvitationUpdatedItem[];
}

export interface InvitationSuccessRow {
  id: string;
  name: string;
  email: string;
  externalId: string | null;
  role: string;
  phantom: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
}

export interface InvitationUpdatedItem {
  id: number;
  name: string;
  email: string;
  externalId: string | null;
  previousExternalId: string | null;
  role: string;
  phantom: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
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
