import {
  SubmissionListData,
  SubmissionMiniEntity,
  SubmissionPermissions,
  SubmissionFilterData,
  SubmissionsTabData,
} from 'types/course/assessment/submissions';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_SUBMISSION_LIST = 'course/submission/SAVE_SUBMISSION_LIST';
export const SAVE_OVERWRITE_SUBMISSION_LIST =
  'course/submission/SAVE_OVERWRITE_SUBMISSION_LIST';

// Action Types
export interface SaveSubmissionListAction {
  type: typeof SAVE_SUBMISSION_LIST;
  isGamified: boolean;
  submissionCount: number;
  submissionList: SubmissionListData[];
  tabs: SubmissionsTabData;
  filter: SubmissionFilterData;
  submissionPermissions: SubmissionPermissions;
}

export interface SaveOverwriteSubmissionListAction {
  type: typeof SAVE_OVERWRITE_SUBMISSION_LIST;
  isGamified: boolean;
  submissionCount: number;
  submissionList: SubmissionListData[];
  tabs: SubmissionsTabData;
  filter: SubmissionFilterData;
  submissionPermissions: SubmissionPermissions;
}

export type SubmissionsActionType =
  | SaveSubmissionListAction
  | SaveOverwriteSubmissionListAction;

// State Types
export interface SubmissionsState {
  isGamified: boolean;
  submissionCount: number;
  submissions: EntityStore<SubmissionMiniEntity>;
  tabs: SubmissionsTabData;
  filter: SubmissionFilterData;
  permissions: SubmissionPermissions;
}
