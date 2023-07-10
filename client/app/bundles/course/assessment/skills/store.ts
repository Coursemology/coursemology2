import { produce } from 'immer';
import {
  SkillBranchListData,
  SkillListData,
  SkillPermissions,
} from 'types/course/assessment/skills/skills';
import {
  createEntityStore,
  removeFromStore,
  removeNulls,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

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
  SkillsActionType,
  SkillState,
} from './types';

const initialState: SkillState = {
  skillBranches: createEntityStore(),
  skills: createEntityStore(),
  permissions: {
    canCreateSkill: false,
    canCreateSkillBranch: false,
  },
};

const reducer = produce((draft: SkillState, action: SkillsActionType) => {
  switch (action.type) {
    case SAVE_SKILL_BRANCH_LIST: {
      const skillBranchList = action.skillBranches;
      const skillBranchEntityList = skillBranchList.map((data) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { skills, ...rest } = data;
        return { ...rest };
      });

      const skillEntityList = removeNulls(
        skillBranchList.flatMap((data) => {
          return data.skills;
        }),
      );

      saveListToStore(draft.skillBranches, skillBranchEntityList);
      saveListToStore(draft.skills, skillEntityList);
      draft.permissions = { ...action.skillPermissions };
      break;
    }
    case SAVE_SKILL: {
      const skillData = action.skill;
      const skillEntity = { ...skillData };
      saveEntityToStore(draft.skills, skillEntity);
      break;
    }
    case SAVE_SKILL_BRANCH: {
      const { skills: skillList, ...skillBranchData } = action.skillBranch;
      const skillBranchEntity = { ...skillBranchData };
      saveEntityToStore(draft.skillBranches, skillBranchEntity);

      if (skillList) {
        saveListToStore(draft.skills, skillList);
      }

      break;
    }
    case DELETE_SKILL: {
      const skillId = action.id;
      if (draft.skills.byId[skillId]) {
        removeFromStore(draft.skills, skillId);
      }
      break;
    }
    case DELETE_SKILL_BRANCH: {
      const branchId = action.id;
      if (draft.skillBranches.byId[branchId]) {
        removeFromStore(draft.skillBranches, branchId);
      }
      break;
    }
    default: {
      break;
    }
  }
}, initialState);

export const actions = {
  saveSkillBranchList: (
    skillBranches: SkillBranchListData[],
    skillPermissions: SkillPermissions,
  ): SaveSkillBranchListAction => {
    return {
      type: SAVE_SKILL_BRANCH_LIST,
      skillBranches,
      skillPermissions,
    };
  },
  saveSkillBranch: (
    skillBranch: SkillBranchListData,
  ): SaveSkillBranchAction => {
    return {
      type: SAVE_SKILL_BRANCH,
      skillBranch,
    };
  },
  saveSkill: (skill: SkillListData): SaveSkillAction => {
    return {
      type: SAVE_SKILL,
      skill,
    };
  },
  deleteSkillBranch: (branchId: number): DeleteSkillBranchAction => {
    return {
      type: DELETE_SKILL_BRANCH,
      id: branchId,
    };
  },
  deleteSkill: (skillId: number): DeleteSkillAction => {
    return {
      type: DELETE_SKILL,
      id: skillId,
    };
  },
};

export default reducer;
