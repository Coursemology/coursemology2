import { produce } from 'immer';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import {
  DELETE_SKILL,
  DELETE_SKILL_BRANCH,
  SAVE_SKILL_BRANCH_LIST,
  SAVE_SKILL_PERMISSIONS,
  SAVE_SKILL_BRANCH_DATA,
  SAVE_SKILL_DATA,
  SkillsActionType,
  SkillState,
} from './types';

const initialState: SkillState = {
  skillPermissions: {
    canCreateSkill: false,
    canCreateSkillBranch: false,
  },
  skillBranches: createEntityStore(),
  skills: createEntityStore(),
};

const reducer = produce((draft: SkillState, action: SkillsActionType) => {
  switch (action.type) {
    case SAVE_SKILL_PERMISSIONS: {
      draft.skillPermissions = { ...action.skillPermissions };
      break;
    }
    case SAVE_SKILL_BRANCH_LIST: {
      saveListToStore(draft.skillBranches, action.skillBranches);
      saveListToStore(draft.skills, action.skills);
      break;
    }
    case SAVE_SKILL_DATA: {
      saveEntityToStore(draft.skills, action.skill);
      break;
    }
    case SAVE_SKILL_BRANCH_DATA: {
      saveEntityToStore(draft.skillBranches, action.skillBranch);
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
