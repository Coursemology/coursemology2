import { Permissions } from 'types';
import { AchievementListData, AchievementMiniEntity } from './achievements';
import { SkillBranchData, SkillBranchEntity } from './skill_branches';

export type UserPermissions = Permissions<
  'canCreate' | 'canManage' | 'canReorder'
>;

/**
 * Data types for achievement data retrieved from backend through API call.
 */

export interface UserListData {
  id: number;
  name: string;
  imageUrl: string;
  //   permissions: UserListDataPermissions;
}

export interface UserData extends UserListData {
  email: string;
  role: string;
  level: number;
  exp: number;
  achievementCount?: number;
  achievements?: AchievementListData[];
  experiencePointsRecordsUrl?: string;
  manageEmailSubscriptionUrl?: string;
  skillBranches?: SkillBranchData[];
}

export interface UserMiniEntity {
  id: number;
  name: string;
  imageUrl: string;
}

export interface UserEntity extends UserMiniEntity {
  email: string;
  role: string;
  level: number;
  exp: number;
  achievementCount?: number;
  achievements?: AchievementMiniEntity[];
  experiencePointsRecordsUrl?: string;
  manageEmailSubscriptionUrl?: string;
  skillBranches?: SkillBranchEntity[];
}
