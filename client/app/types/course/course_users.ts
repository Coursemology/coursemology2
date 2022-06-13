import type {
  AchievementListData,
  AchievementMiniEntity,
} from './achievements';
import {
  UserSkillBranchEntity,
  UserSkillBranchData,
} from './assessment/skills/skills';

export interface CourseUserListData {
  id: number;
  name: string;
  imageUrl: string;
  phantom?: boolean;
}

export interface CourseUserMiniEntity {
  id: number;
  name: string;
  imageUrl: string;
  phantom?: boolean;
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
  skillBranches?: UserSkillBranchData[];
}

export interface CourseUserEntity extends CourseUserMiniEntity {
  email: string;
  role: string;
  level: number;
  exp: number;
  achievements?: AchievementMiniEntity[];
  experiencePointsRecordsUrl?: string;
  manageEmailSubscriptionUrl?: string;
  skillBranches?: UserSkillBranchEntity[];
}
