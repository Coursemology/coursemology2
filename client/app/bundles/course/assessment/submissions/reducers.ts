import { produce } from 'immer';
import { createEntityStore, saveListToStore } from 'utilities/store';
import {
  SAVE_SUBMISSION_LIST,
  SubmissionsActionType,
  SubmissionsState,
} from './types';

const initialState: SubmissionsState = {
  submissions: createEntityStore(),
  metaData: {
    isGamified: false,
    submissionCount: 0,
    tabs: { categories: [] },
    filter: { assessments: [], groups: [], users: [] },
  },
  permissions: { canManage: false, isTeachingStaff: false },
};

const reducer = produce(
  (draft: SubmissionsState, action: SubmissionsActionType) => {
    switch (action.type) {
      case SAVE_SUBMISSION_LIST: {
        const submissionList = action.submissionList;
        const entityList = submissionList.map((data) => ({ ...data }));

        if (action.overwrite) {
          draft.submissions = createEntityStore();
        }

        saveListToStore(draft.submissions, entityList);
        draft.metaData = action.metaData;
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
