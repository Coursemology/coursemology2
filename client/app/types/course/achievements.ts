import { Permissions } from 'types';
import { ConditionListData, ConditionsData } from './conditions';
import type { CourseUserListData, CourseUserMiniEntity } from './courseUsers';

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
  conditionsData: ConditionsData;
  achievementUsers: CourseUserListData[];
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
  conditionsData: ConditionsData;
  achievementUsers: AchievementCourseUserEntity[];
}

export interface AchievementCourseUserEntity extends CourseUserMiniEntity {
  obtainedAt?: string | null;
}

/**
 * Data types for achievement form data.
 */

export interface AchievementFormData {
  id?: number;
  title: string;
  description: string;
  badge: BadgeEntity;
  published: boolean;
}
