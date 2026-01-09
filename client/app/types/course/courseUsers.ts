import { Permissions } from 'types';

import {
  UserSkillBranchListData,
  UserSkillBranchMiniEntity,
} from './assessment/skills/userSkills';
import type {
  AchievementListData,
  AchievementMiniEntity,
} from './achievements';
import { TimelineAlgorithm } from './personalTimes';

export type ManageCourseUsersPermissions = Permissions<
  | 'canManageCourseUsers'
  | 'canManageEnrolRequests'
  | 'canManagePersonalTimes'
  | 'canManageReferenceTimelines'
  | 'canRegisterWithCode'
>;

export const COURSE_STAFF_ROLES = [
  'teaching_assistant',
  'manager',
  'owner',
  'observer',
] as const;

export const COURSE_USER_ROLES = ['student', ...COURSE_STAFF_ROLES] as const;

export type CourseUserRole = (typeof COURSE_USER_ROLES)[number];
export type CourseStaffRole = (typeof COURSE_STAFF_ROLES)[number];

export interface CourseUserShape {
  id: number;
  name: string;
  role: CourseUserRole;
  isPhantom: boolean;
}

export interface CourseUserBasicListData {
  id: number;
  name: string;
  userUrl?: string;
  imageUrl?: string;
  role?: CourseUserRole;
}

export interface CourseUserListData extends CourseUserBasicListData {
  email: string;
  role: CourseUserRole;
  phantom?: boolean;
  timelineAlgorithm?: TimelineAlgorithm;
}

export interface CourseUserBasicMiniEntity {
  id: CourseUserBasicListData['id'];
  name: CourseUserBasicListData['name'];
  userUrl?: CourseUserBasicListData['userUrl'];
  imageUrl?: CourseUserBasicListData['userUrl'];
  role?: CourseUserBasicListData['role'];
}

export interface CourseUserMiniEntity extends CourseUserBasicMiniEntity {
  phantom?: CourseUserListData['phantom'];
  email: CourseUserListData['email'];
  role: CourseUserListData['role'];
  timelineAlgorithm?: CourseUserListData['timelineAlgorithm'];
  referenceTimelineId?: number | null;
  groups?: string[];
}

/**
 * Data types for course user data retrieved from backend through API call.
 */
export interface CourseUserData extends CourseUserListData {
  level: number;
  exp: number;
  achievements?: AchievementListData[];
  experiencePointsRecordsUrl?: string;
  skillBranches?: UserSkillBranchListData[];
  learningRate?: number;
  learningRateEffectiveMin?: number;
  learningRateEffectiveMax?: number;
  canReadStatistics: boolean;
}

export interface CourseUserEntity extends CourseUserMiniEntity {
  level: number;
  exp: number;
  achievements?: AchievementMiniEntity[];
  experiencePointsRecordsUrl?: string;
  skillBranches?: UserSkillBranchMiniEntity[];
  learningRate?: number;
  learningRateEffectiveMin?: number;
  learningRateEffectiveMax?: number;
  canReadStatistics: boolean;
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
    name?: string;
    phantom?: boolean;
    timeline_algorithm?: TimelineAlgorithm;
    reference_timeline_id?: number | null;
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

export interface LearningRateRecordsData {
  learningRateRecords: {
    id: number;
    learningRate: number;
    createdAt: string;
  }[];
}

export interface LearningRateRecordEntity {
  id: number;
  learningRatePercentage: number;
  createdAt: Date;
}

export interface LearningRateRecordsEntity {
  learningRateRecords: LearningRateRecordEntity[];
}
