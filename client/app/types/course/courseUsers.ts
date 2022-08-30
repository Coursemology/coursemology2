import sharedConstants from 'lib/constants/sharedConstants';
import { Permissions, Roles } from 'types';
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

export type CourseUserRoles = Roles<
  'student' | 'teaching_assistant' | 'manager' | 'owner' | 'observer'
>;

export type StaffRoles = Roles<
  'teaching_assistant' | 'manager' | 'owner' | 'observer'
>;

export type CourseUserRole = keyof typeof sharedConstants.COURSE_USER_ROLES;
export type StaffRole = keyof typeof sharedConstants.STAFF_ROLES;

export interface CourseUserBasicListData {
  id: number;
  name: string;
  userUrl?: string;
  imageUrl?: string;
  role?: CourseUserRole;
}

export interface CourseUserListData extends CourseUserBasicListData {
  phantom?: boolean;
  email: string;
  role: CourseUserRole;
  timelineAlgorithm?: TimelineAlgorithm;
}

export interface CourseUserBasicMiniEntity {
  id: number;
  name: string;
  userUrl?: string;
  imageUrl?: string;
  role?: CourseUserRole;
}

export interface CourseUserMiniEntity extends CourseUserBasicMiniEntity {
  phantom?: boolean;
  email: string;
  role: CourseUserRole;
  timelineAlgorithm?: TimelineAlgorithm;
}

/**
 * Data types for course user data retrieved from backend through API call.
 */
export interface CourseUserData extends CourseUserListData {
  level: number;
  exp: number;
  achievements?: AchievementListData[];
  experiencePointsRecordsUrl?: string;
  manageEmailSubscriptionUrl?: string;
  skillBranches?: UserSkillBranchListData[];
  learningRate?: number;
  learningRateEffectiveMin?: number;
  learningRateEffectiveMax?: number;
}

export interface CourseUserEntity extends CourseUserMiniEntity {
  level: number;
  exp: number;
  achievements?: AchievementMiniEntity[];
  experiencePointsRecordsUrl?: string;
  manageEmailSubscriptionUrl?: string;
  skillBranches?: UserSkillBranchMiniEntity[];
  learningRate?: number;
  learningRateEffectiveMin?: number;
  learningRateEffectiveMax?: number;
}

export interface CourseUserFormData {
  id: number;
  name: string;
  phantom: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
  role?: CourseUserRole;
}

/**
 * Data types for PATCH course user via /update
 */
export interface UpdateCourseUserPatchData {
  course_user: {
    name: string;
    phantom?: boolean;
    timeline_algorithm?: TimelineAlgorithm;
    role?: CourseUserRole;
  };
}

/**
 * Shared data for Manage Course Users component
 * - Count of enrol requests and invitations (to render badges on tabs)
 * - Default course timeline algorithm (for default selection)
 * We only need counts, as certain pages don't retrieve enrol requests nor invitations
 */
export interface ManageCourseUsersSharedData {
  requestsCount: number;
  invitationsCount: number;
  defaultTimelineAlgorithm: TimelineAlgorithm;
}

/**
 * Row data from ManageUsersTable Datatable
 */
export interface CourseUserRowData extends CourseUserEntity {
  'S/N'?: number;
  actions?: undefined;
}
