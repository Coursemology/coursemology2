import {
  SkillBranchData,
  SkillPermissions,
  SkillBranchEntity,
  SkillEntity,
  SkillData,
} from 'types/course/assessment/skills/skills';
import { EntityStore } from 'types/store';

// Action Names

export const SAVE_SKILL_PERMISSIONS =
  'course/assessment/skills/SAVE_SKILL_PERMISSIONS';
export const SAVE_SKILL_BRANCH_LIST =
  'course/assessment/skills/SAVE_SKILL_BRANCH_LIST';
export const SAVE_SKILL_DATA = 'course/assessment/skills/SAVE_SKILL_DATA';
export const SAVE_SKILL_BRANCH_DATA =
  'course/assessment/skills/SAVE_SKILL_BRANCH_DATA';
export const DELETE_SKILL = 'course/assessment/skills/DELETE_SKILL';
export const DELETE_SKILL_BRANCH =
  'course/assessment/skills/DELETE_SKILL_BRANCH';

// Action Types

export interface SaveSkillBranchListAction {
  type: typeof SAVE_SKILL_BRANCH_LIST;
  skillBranches: SkillBranchData[];
  skills: SkillData[];
}

export interface SaveSkillDataAction {
  type: typeof SAVE_SKILL_DATA;
  skill: SkillEntity;
}

export interface SaveSkillBranchDataAction {
  type: typeof SAVE_SKILL_BRANCH_DATA;
  skillBranch: SkillBranchEntity;
}

export interface SaveSkillPermissionsAction {
  type: typeof SAVE_SKILL_PERMISSIONS;
  skillPermissions: SkillPermissions;
}

export interface DeleteSkillAction {
  type: typeof DELETE_SKILL;
  id: number;
}

export interface DeleteSkillBranchAction {
  type: typeof DELETE_SKILL_BRANCH;
  id: number;
}

export type SkillsActionType =
  | SaveSkillBranchListAction
  | SaveSkillPermissionsAction
  | SaveSkillDataAction
  | SaveSkillBranchDataAction
  | DeleteSkillBranchAction
  | DeleteSkillAction;

// State Types

export interface SkillState {
  skillPermissions: SkillPermissions;
  skillBranches: EntityStore<SkillBranchEntity>;
  skills: EntityStore<SkillEntity>;
}

// Dialog Types

export enum DialogTypes {
  'NewSkill' = 0,
  'NewSkillBranch' = 1,
  'EditSkill' = 3,
  'EditSkillBranch' = 4,
}

// Table Types
export enum TableTypes {
  'SkillBranches' = 0,
  'Skills' = 1,
}
