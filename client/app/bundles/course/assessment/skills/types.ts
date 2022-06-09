import {
  SkillBranchData, SkillSettings, SkillBranchEntity
} from 'types/course/assessment/skills/skills';
import { EntityStore } from 'types/store';

// Action Names

export const SAVE_SKILLS_SETTINGS =
  'course/assessment/skills/SAVE_SKILLS_SETTINGS';
export const SAVE_SKILLS_LIST_DATA =
  'course/assessment/skills/SAVE_SKILLS_LIST_DATA';
export const DELETE_SKILL_BRANCH = 'course/assessment/skills/DELETE_SKILL_BRANCH';

// Action Types

export interface SaveSkillListDataAction {
  type: typeof SAVE_SKILLS_LIST_DATA;
  skillBranches: SkillBranchData[];
}


export interface SaveSkillSettingsAction {
  type: typeof SAVE_SKILLS_SETTINGS;
  skillSettings: SkillSettings;
}

export interface DeleteSkillBranchAction {
  type: typeof DELETE_SKILL_BRANCH;
  id: number;
}

export type SkillsActionType =
  | SaveSkillListDataAction
  | SaveSkillSettingsAction
  | DeleteSkillBranchAction;

// State Types

export interface SkillState {
  skillSettings: SkillSettings;
  skillBranches: EntityStore<SkillBranchEntity>;
}
