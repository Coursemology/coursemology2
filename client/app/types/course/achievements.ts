import { Permissions } from 'types';
import { ConditionData, ConditionListData, Conditions } from './conditions';
import type { CourseUserListData, CourseUserMiniEntity } from './course_users';

export interface BadgeEntity {
  name: string;
  url: string;
  file?: Blob;
}

export type AchievementPermissions = Permissions<
  'canCreate' | 'canManage' | 'canReorder'
>;

export type AchievementListDataPermissions = Permissions<
  'canAward' | 'canDelete' | 'canDisplayBadge' | 'canEdit' | 'canManage'
>;

/**
 * Data types for achievement data retrieved from backend through API call.
 */

export interface Achievement {
  id: number;
  title: string;
  badge: BadgeEntity;
}

export interface AchievementListData extends Achievement {
  description: string;
  conditions: ConditionListData[];
  weight: number;
  published: boolean;
  achievementStatus: 'granted' | 'locked' | null;
  permissions: AchievementListDataPermissions;
}

export interface AchievementData extends AchievementListData {
  conditions: ConditionData[];
  achievementUsers: CourseUserListData[];
  enabledConditions: Conditions[];
}

export interface AchievementCourseUserData extends CourseUserListData {
  obtainedAt?: string | null;
}

/**
 * Data types for achievement data used in frontend that are converted from
 * received backend data.
 */

export interface AchievementMiniEntity extends Achievement {
  description: string;
  conditions: ConditionListData[];
  weight: number;
  published: boolean;
  achievementStatus: 'granted' | 'locked' | null;
  permissions: AchievementListDataPermissions;
}

export interface AchievementEntity extends AchievementMiniEntity {
  conditions: ConditionData[];
  achievementUsers: AchievementCourseUserEntity[];
  enabledConditions: Conditions[];
}

export interface AchievementCourseUserEntity extends CourseUserMiniEntity {
  obtainedAt?: string | null;
}

/**
 * Data types for achievement form data.
 */

export interface AchievementFormData {
  title: string;
  description: string;
  badge: BadgeEntity;
  published: boolean;
}

export interface AchievementEditFormData extends AchievementFormData {
  id: number;
}
