import { produce } from 'immer';
import {
  SubmissionListData,
  SubmissionPermissions,
  SubmissionsMetaData,
} from 'types/course/assessment/submissions';
import { createEntityStore, saveListToStore } from 'utilities/store';

import {
  SAVE_SUBMISSION_LIST,
  SaveSubmissionListAction,
  SubmissionsActionType,
  SubmissionsState,
} from 'bundles/course/assessment/submissions/types';

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

export const actions = {
  saveSubmissionList: (
    submissionList: SubmissionListData[],
    metaData: SubmissionsMetaData,
    submissionPermissions: SubmissionPermissions,
    overwrite: boolean,
  ): SaveSubmissionListAction => ({
    type: SAVE_SUBMISSION_LIST,
    submissionList,
    metaData,
    submissionPermissions,
    overwrite,
  }),
};

export default reducer;
