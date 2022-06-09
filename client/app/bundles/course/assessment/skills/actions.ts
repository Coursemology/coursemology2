import {
  SkillBranchData,
  SkillSettings,
} from 'types/course/assessment/skills/skills';
import {
  DeleteSkillBranchAction,
  DELETE_SKILL_BRANCH,
  SaveSkillListDataAction,
  SaveSkillSettingsAction, SAVE_SKILLS_LIST_DATA, SAVE_SKILLS_SETTINGS,
} from './types';

export function saveSkillSettings(
  skillSettings: SkillSettings,
): SaveSkillSettingsAction {
  return {
    type: SAVE_SKILLS_SETTINGS,
    skillSettings,
  };
}

export function saveSkillListData(
  skillBranches: SkillBranchData[],
): SaveSkillListDataAction {
  return {
    type: SAVE_SKILLS_LIST_DATA,
    skillBranches,
  };
}

export function deleteAchievement(
  branchId: number,
): DeleteSkillBranchAction {
  return {
    type: DELETE_SKILL_BRANCH,
    id: branchId,
  };
}
