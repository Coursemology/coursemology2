import {
  SubmissionListData,
  SubmissionMiniEntity,
  SubmissionPermissions,
  SubmissionsMetaData,
} from 'types/course/assessment/submissions';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_SUBMISSION_LIST = 'course/submission/SAVE_SUBMISSION_LIST';

// Action Types
export interface SaveSubmissionListAction {
  type: typeof SAVE_SUBMISSION_LIST;
  submissionList: SubmissionListData[];
  metaData: SubmissionsMetaData;
  submissionPermissions: SubmissionPermissions;
  overwrite: boolean;
}

export type SubmissionsActionType = SaveSubmissionListAction;

// State Types
export interface SubmissionsState {
  submissions: EntityStore<SubmissionMiniEntity>;
  metaData: SubmissionsMetaData;
  permissions: SubmissionPermissions;
}
