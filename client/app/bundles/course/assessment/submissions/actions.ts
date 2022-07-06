import {
  SubmissionListData,
  SubmissionPermissions,
  SubmissionFilterData,
  SubmissionsTabData,
} from 'types/course/assessment/submissions';
import {
  SaveOverwriteSubmissionListAction,
  SaveSubmissionListAction,
  SAVE_OVERWRITE_SUBMISSION_LIST,
  SAVE_SUBMISSION_LIST,
} from './types';

export function saveSubmissionList(
  isGamified: boolean,
  submissionCount: number,
  submissionList: SubmissionListData[],
  tabs: SubmissionsTabData,
  filter: SubmissionFilterData,
  submissionPermissions: SubmissionPermissions,
): SaveSubmissionListAction {
  return {
    type: SAVE_SUBMISSION_LIST,
    isGamified,
    submissionCount,
    submissionList,
    tabs,
    filter,
    submissionPermissions,
  };
}

export function saveOverwriteSubmissionList(
  isGamified: boolean,
  submissionCount: number,
  submissionList: SubmissionListData[],
  tabs: SubmissionsTabData,
  filter: SubmissionFilterData,
  submissionPermissions: SubmissionPermissions,
): SaveOverwriteSubmissionListAction {
  return {
    type: SAVE_OVERWRITE_SUBMISSION_LIST,
    isGamified,
    submissionCount,
    submissionList,
    tabs,
    filter,
    submissionPermissions,
  };
}
