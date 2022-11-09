import {
  SubmissionListData,
  SubmissionPermissions,
  SubmissionsMetaData,
} from 'types/course/assessment/submissions';

import { SAVE_SUBMISSION_LIST, SaveSubmissionListAction } from './types';

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
