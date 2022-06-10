import { Permissions } from 'types';
import type {
  AchievementListData,
  AchievementMiniEntity,
} from './achievements';
import {
  UserSkillBranchMiniEntity,
  UserSkillBranchListData,
} from './assessment/skills/userSkills';
import { TimelineAlgorithm } from './personalTimes';

export type ManageCourseUsersPermissions = Permissions<
  | 'canManageCourseUsers'
  | 'canManageEnrolRequests'
  | 'canManagePersonalTimes'
  | 'canRegisterWithCode'
>;

export interface CourseUserListData {
  id: number;
  name: string;
  imageUrl: string;
  phantom: boolean;
}

export interface CourseUserMiniEntity {
  id: number;
  name: string;
  imageUrl: string;
  phantom: boolean;
}

/**
 * Data types for course user data retrieved from backend through API call.
 */
export interface CourseUserData extends CourseUserListData {
  email: string;
  role: string;
  level: number;
  exp: number;
  achievements?: AchievementListData[];
  experiencePointsRecordsUrl?: string;
  manageEmailSubscriptionUrl?: string;
  skillBranches?: UserSkillBranchListData[];
  timelineAlgorithm?: TimelineAlgorithm;
}

export interface CourseUserEntity extends CourseUserMiniEntity {
  email: string;
  role: string;
  level: number;
  exp: number;
  achievements?: AchievementMiniEntity[];
  experiencePointsRecordsUrl?: string;
  manageEmailSubscriptionUrl?: string;
  skillBranches?: UserSkillBranchMiniEntity[];
  timelineAlgorithm?: TimelineAlgorithm;
}

export interface CourseUserFormData {
  id: number;
  name: string;
  phantom: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
  role?: string;
}

/**
 * Data types for PATCH course user via /update
 */
export interface UpdateCourseUserPatchData {
  course_user: {
    name: string;
    phantom: boolean;
    timeline_algorithm?: TimelineAlgorithm;
    role?: string;
  };
}

/**
 * Count of enrol requests and invitations
 * Used to render badges in tabs on Manage Users page
 * We only need counts, as certain pages don't retrieve enrol requests nor invitations
 */
export interface ManageCourseUsersTabData {
  requestsCount: number;
  invitationsCount: number;
}
