import {
  SkillBranchListData,
  SkillBranchMiniEntity,
  SkillListData,
  SkillMiniEntity,
  SkillPermissions,
} from 'types/course/assessment/skills/skills';
import { EntityStore } from 'types/store';

// Action Names

export const SAVE_SKILL_BRANCH_LIST =
  'course/assessment/skills/SAVE_SKILL_BRANCH_LIST';
export const SAVE_SKILL_BRANCH = 'course/assessment/skills/SAVE_SKILL_BRANCH';
export const SAVE_SKILL = 'course/assessment/skills/SAVE_SKILL';
export const DELETE_SKILL_BRANCH =
  'course/assessment/skills/DELETE_SKILL_BRANCH';
export const DELETE_SKILL = 'course/assessment/skills/DELETE_SKILL';

// Action Types

export interface SaveSkillBranchListAction {
  type: typeof SAVE_SKILL_BRANCH_LIST;
  skillBranches: SkillBranchListData[];
  skillPermissions: SkillPermissions;
}

export interface SaveSkillAction {
  type: typeof SAVE_SKILL;
  skill: SkillListData;
}

export interface SaveSkillBranchAction {
  type: typeof SAVE_SKILL_BRANCH;
  skillBranch: SkillBranchListData;
}

export interface DeleteSkillBranchAction {
  type: typeof DELETE_SKILL_BRANCH;
  id: number;
}
export interface DeleteSkillAction {
  type: typeof DELETE_SKILL;
  id: number;
}

export type SkillsActionType =
  | SaveSkillBranchListAction
  | SaveSkillBranchAction
  | SaveSkillAction
  | DeleteSkillBranchAction
  | DeleteSkillAction;

// State Types

export interface SkillState {
  skillBranches: EntityStore<SkillBranchMiniEntity>;
  skills: EntityStore<SkillMiniEntity>;
  permissions: SkillPermissions;
}

// Dialog Enums

export enum DialogTypes {
  'NewSkill' = 0,
  'NewSkillBranch' = 1,
  'EditSkill' = 3,
  'EditSkillBranch' = 4,
}

// Table Enums

export enum TableEnum {
  'SkillBranches' = 0,
  'Skills' = 1,
}
