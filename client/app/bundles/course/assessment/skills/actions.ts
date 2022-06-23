import {
  SkillBranchListData,
  SkillListData,
  SkillPermissions,
} from 'types/course/assessment/skills/skills';
import {
  SAVE_SKILL_BRANCH_LIST,
  SAVE_SKILL_BRANCH,
  SAVE_SKILL,
  DELETE_SKILL_BRANCH,
  DELETE_SKILL,
  SaveSkillBranchListAction,
  SaveSkillBranchAction,
  SaveSkillAction,
  DeleteSkillBranchAction,
  DeleteSkillAction,
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
