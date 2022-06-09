import { produce } from 'immer';
import { createEntityStore, removeFromStore, saveListToStore } from 'utilities/store';
import { DELETE_SKILL_BRANCH, SAVE_SKILLS_LIST_DATA, SAVE_SKILLS_SETTINGS, SkillsActionType, SkillState } from './types';

const initialState: SkillState = {
  skillSettings: {
    canCreateSkill: false,
    canCreateSkillBranch: false,
    headerTitle: '',
    headerDescription: '',
  },
  skillBranches: createEntityStore(),
};

const reducer = produce(
  (draft: SkillState, action: SkillsActionType) => {
    switch (action.type) {
      case SAVE_SKILLS_SETTINGS: {
        draft.skillSettings = { ...action.skillSettings };
        break;
      }
      case SAVE_SKILLS_LIST_DATA: {
        saveListToStore(
          draft.skillBranches,
          action.skillBranches,
        );
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
  },
  initialState,
);

export default reducer;
