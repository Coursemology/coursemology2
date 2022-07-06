import { produce } from 'immer';
import { createEntityStore, saveListToStore } from 'utilities/store';
import {
  SAVE_OVERWRITE_SUBMISSION_LIST,
  SAVE_SUBMISSION_LIST,
  SubmissionsActionType,
  SubmissionsState,
} from './types';

const initialState: SubmissionsState = {
  isGamified: false,
  submissionCount: 0,
  submissions: createEntityStore(),
  tabs: { categories: [] },
  filter: { assessments: [], groups: [], users: [] },
  permissions: { canManage: false, isTeachingStaff: false },
};

const reducer = produce(
  (draft: SubmissionsState, action: SubmissionsActionType) => {
    switch (action.type) {
      case SAVE_SUBMISSION_LIST: {
        const submissionList = action.submissionList;
        const entityList = submissionList.map((data) => ({ ...data }));

        draft.isGamified = action.isGamified;
        draft.submissionCount = action.submissionCount;
        saveListToStore(draft.submissions, entityList);
        draft.tabs = action.tabs;
        draft.filter = action.filter;
        draft.permissions = action.submissionPermissions;
        break;
      }

      case SAVE_OVERWRITE_SUBMISSION_LIST: {
        const submissionList = action.submissionList;
        const entityList = submissionList.map((data) => ({ ...data }));

        draft.isGamified = action.isGamified;
        draft.submissionCount = action.submissionCount;
        draft.submissions = createEntityStore();
        saveListToStore(draft.submissions, entityList);
        draft.tabs = action.tabs;
        draft.filter = action.filter;
        draft.permissions = action.submissionPermissions;
        break;
      }

      default:
        break;
    }
  },
  initialState,
);

export default reducer;
