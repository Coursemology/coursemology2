import {
  SubmissionListData,
  SubmissionPermissions,
  SubmissionsMetaData,
} from 'types/course/assessment/submissions';
import { SaveSubmissionListAction, SAVE_SUBMISSION_LIST } from './types';

// eslint-disable-next-line import/prefer-default-export
export function saveSubmissionList(
  submissionList: SubmissionListData[],
  metaData: SubmissionsMetaData,
  submissionPermissions: SubmissionPermissions,
  overwrite: boolean,
): SaveSubmissionListAction {
  return {
    type: SAVE_SUBMISSION_LIST,
    submissionList,
    metaData,
    submissionPermissions,
    overwrite,
  };
}
