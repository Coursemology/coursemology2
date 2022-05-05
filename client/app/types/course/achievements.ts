import { Permissions } from 'types';
import { ConditionData, ConditionListData, Conditions } from './conditions';
import { CourseUserData, CourseUserEntity } from './course_users';

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
export interface AchievementListData {
  id: number;
  title: string;
  description: string;
  conditions: ConditionListData[];
  badge: BadgeEntity;
  weight: number;
  published: boolean;
  achievementStatus: 'granted' | 'locked' | null;
  permissions: AchievementListDataPermissions;
}

export interface AchievementData extends AchievementListData {
  conditions: ConditionData[];
  achievementUsers: CourseUserData[];
  enabledConditions: Conditions[];
}

export interface AchievementCourseUserData extends CourseUserData {
  obtainedAt?: string | null;
}

/**
 * Data types for achievement data used in frontend that are converted from
 * received backend data.
 */

export interface AchievementMiniEntity {
  id: number;
  title: string;
  description: string;
  conditions: ConditionListData[];
  badge: BadgeEntity;
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

export interface AchievementCourseUserEntity extends CourseUserEntity {
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
