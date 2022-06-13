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
  SAVE_SKILLS_LIST_DATA,
  SAVE_SKILLS_SETTINGS,
  SAVE_SKILL_BRANCH_DATA,
  SAVE_SKILL_DATA,
  SkillsActionType,
  SkillState,
} from './types';

const initialState: SkillState = {
  skillSettings: {
    canCreateSkill: false,
    canCreateSkillBranch: false,
    headerTitle: '',
    headerDescription: '',
  },
  skillBranches: createEntityStore(),
  skills: createEntityStore(),
};

const reducer = produce((draft: SkillState, action: SkillsActionType) => {
  switch (action.type) {
    case SAVE_SKILLS_SETTINGS: {
      draft.skillSettings = { ...action.skillSettings };
      break;
    }
    case SAVE_SKILLS_LIST_DATA: {
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
