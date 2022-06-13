import {
  SkillBranchData,
  SkillBranchEntity,
  SkillData,
  SkillEntity,
  SkillSettings,
} from 'types/course/assessment/skills/skills';
import {
  DeleteSkillAction,
  DeleteSkillBranchAction,
  DELETE_SKILL,
  DELETE_SKILL_BRANCH,
  SaveSkillBranchDataAction,
  SaveSkillDataAction,
  SaveSkillListDataAction,
  SaveSkillSettingsAction, SAVE_SKILLS_LIST_DATA, SAVE_SKILLS_SETTINGS, SAVE_SKILL_BRANCH_DATA, SAVE_SKILL_DATA,
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
  const skills = skillBranches.flatMap((branch: SkillBranchData) => {
    return branch.skills
  }).filter(skill => skill) as SkillData[];
  const newSkillBranches: SkillBranchEntity[] = skillBranches.map((skillBranch: SkillBranchData) => {
    const { skills, ...newSkillBranch } = skillBranch;
    return newSkillBranch;
  })
  return {
    type: SAVE_SKILLS_LIST_DATA,
    skillBranches: newSkillBranches,
    skills,
  };
}

export function saveSkillData(
  skill: SkillEntity,
): SaveSkillDataAction {
  return {
    type: SAVE_SKILL_DATA,
    skill: skill,
  };
}

export function saveSkillBranchData(
  skillBranch: SkillBranchEntity,
): SaveSkillBranchDataAction {
  return {
    type: SAVE_SKILL_BRANCH_DATA,
    skillBranch: skillBranch,
  };
}

export function deleteSkill(
  skillId: number,
): DeleteSkillAction {
  return {
    type: DELETE_SKILL,
    id: skillId,
  };
}

export function deleteSkillBranch(
  branchId: number,
): DeleteSkillBranchAction {
  return {
    type: DELETE_SKILL_BRANCH,
    id: branchId,
  };
}
