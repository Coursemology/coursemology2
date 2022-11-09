import {
  SkillBranchListData,
  SkillListData,
  SkillPermissions,
} from 'types/course/assessment/skills/skills';

import {
  DELETE_SKILL,
  DELETE_SKILL_BRANCH,
  DeleteSkillAction,
  DeleteSkillBranchAction,
  SAVE_SKILL,
  SAVE_SKILL_BRANCH,
  SAVE_SKILL_BRANCH_LIST,
  SaveSkillAction,
  SaveSkillBranchAction,
  SaveSkillBranchListAction,
} from './types';

export function saveSkillBranchList(
  skillBranches: SkillBranchListData[],
  skillPermissions: SkillPermissions,
): SaveSkillBranchListAction {
  return {
    type: SAVE_SKILL_BRANCH_LIST,
    skillBranches,
    skillPermissions,
  };
}

export function saveSkillBranch(
  skillBranch: SkillBranchListData,
): SaveSkillBranchAction {
  return {
    type: SAVE_SKILL_BRANCH,
    skillBranch,
  };
}

export function saveSkill(skill: SkillListData): SaveSkillAction {
  return {
    type: SAVE_SKILL,
    skill,
  };
}

export function deleteSkillBranch(branchId: number): DeleteSkillBranchAction {
  return {
    type: DELETE_SKILL_BRANCH,
    id: branchId,
  };
}

export function deleteSkill(skillId: number): DeleteSkillAction {
  return {
    type: DELETE_SKILL,
    id: skillId,
  };
}
