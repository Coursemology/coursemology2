import { produce } from 'immer';
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
  SAVE_SKILL,
  SAVE_SKILL_BRANCH,
  SAVE_SKILL_BRANCH_LIST,
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

export default reducer;
