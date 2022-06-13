import {
  SkillBranchData,
  SkillSettings,
  SkillBranchEntity,
  SkillEntity,
  SkillData,
} from 'types/course/assessment/skills/skills';
import { EntityStore } from 'types/store';

// Action Names

export const SAVE_SKILLS_SETTINGS =
  'course/assessment/skills/SAVE_SKILLS_SETTINGS';
export const SAVE_SKILLS_LIST_DATA =
  'course/assessment/skills/SAVE_SKILLS_LIST_DATA';
export const SAVE_SKILL_DATA = 'course/assessment/skills/SAVE_SKILL_DATA';
export const SAVE_SKILL_BRANCH_DATA =
  'course/assessment/skills/SAVE_SKILL_BRANCH_DATA';
export const DELETE_SKILL = 'course/assessment/skills/DELETE_SKILL';
export const DELETE_SKILL_BRANCH =
  'course/assessment/skills/DELETE_SKILL_BRANCH';

// Action Types

export interface SaveSkillListDataAction {
  type: typeof SAVE_SKILLS_LIST_DATA;
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

export interface SaveSkillSettingsAction {
  type: typeof SAVE_SKILLS_SETTINGS;
  skillSettings: SkillSettings;
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
  | SaveSkillListDataAction
  | SaveSkillSettingsAction
  | SaveSkillDataAction
  | SaveSkillBranchDataAction
  | DeleteSkillBranchAction
  | DeleteSkillAction;

// State Types

export interface SkillState {
  skillSettings: SkillSettings;
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
