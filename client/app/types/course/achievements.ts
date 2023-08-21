import { Permissions } from 'types';

import { ConditionListData, ConditionsData } from './conditions';
import type { CourseUserListData, CourseUserMiniEntity } from './courseUsers';

export type AchievementPermissions = Permissions<
  'canCreate' | 'canManage' | 'canReorder'
>;

export type AchievementListDataPermissions = Permissions<
  'canAward' | 'canDelete' | 'canDisplayBadge' | 'canEdit' | 'canManage'
>;

export interface AchievementListData {
  id: number;
  title: string;
  badge: { name: string; url?: string | null };
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

export interface AchievementMiniEntity {
  id: number;
  title: string;
  badge: { name: string; url?: string | null };
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
  badge: {
    name: string;
    url?: string | null;
    file?: Blob;
  };
  published: boolean;
}
