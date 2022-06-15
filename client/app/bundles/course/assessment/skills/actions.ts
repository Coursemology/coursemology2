import {
  SkillBranchData,
  SkillBranchEntity,
  SkillData,
  SkillEntity,
  SkillPermissions,
} from 'types/course/assessment/skills/skills';
import {
  DeleteSkillAction,
  DeleteSkillBranchAction,
  DELETE_SKILL,
  DELETE_SKILL_BRANCH,
  SaveSkillBranchDataAction,
  SaveSkillDataAction,
  SaveSkillBranchListAction,
  SaveSkillPermissionsAction,
  SAVE_SKILL_BRANCH_LIST,
  SAVE_SKILL_PERMISSIONS,
  SAVE_SKILL_BRANCH_DATA,
  SAVE_SKILL_DATA,
} from './types';

export function saveSkillPermissions(
  skillPermissions: SkillPermissions,
): SaveSkillPermissionsAction {
  return {
    type: SAVE_SKILL_PERMISSIONS,
    skillPermissions,
  };
}

export function saveSkillBranchList(
  skillBranches: SkillBranchData[],
): SaveSkillBranchListAction {
  const skills = skillBranches
    .flatMap((branch: SkillBranchData) => {
      return branch.skills;
    })
    .filter((skill) => skill) as SkillData[];
  const newSkillBranches: SkillBranchEntity[] = skillBranches.map(
    (skillBranch: SkillBranchData) => {
      const newSkillBranch = { skills: undefined, ...skillBranch }; // eslint-disable-line react/no-unused-prop-types
      return newSkillBranch;
    },
  );
  return {
    type: SAVE_SKILL_BRANCH_LIST,
    skillBranches: newSkillBranches,
    skills,
  };
}

export function saveSkillData(skill: SkillEntity): SaveSkillDataAction {
  return {
    type: SAVE_SKILL_DATA,
    skill,
  };
}

export function saveSkillBranchData(
  skillBranch: SkillBranchEntity,
): SaveSkillBranchDataAction {
  return {
    type: SAVE_SKILL_BRANCH_DATA,
    skillBranch,
  };
}

export function deleteSkill(skillId: number): DeleteSkillAction {
  return {
    type: DELETE_SKILL,
    id: skillId,
  };
}

export function deleteSkillBranch(branchId: number): DeleteSkillBranchAction {
  return {
    type: DELETE_SKILL_BRANCH,
    id: branchId,
  };
}
