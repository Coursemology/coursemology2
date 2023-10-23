import { AxiosError } from 'axios';
import { Operation } from 'store';
import {
  ExperiencePointsRecordListData,
  ExperiencePointsRowData,
  UpdateExperiencePointsRecordPatchData,
} from 'types/course/experiencePointsRecords';
import { JobCompleted, JobErrored } from 'types/jobs';

import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/jobHelpers';

import { actions } from './store';

const DOWNLOAD_JOB_POLL_INTERVAL_MS = 2000;

const formatUpdateExperiencePointsRecord = (
  data: ExperiencePointsRowData,
): UpdateExperiencePointsRecordPatchData => {
  return {
    experience_points_record: {
      reason: data.reason ? data.reason.trim() : data.reason,
      points_awarded: parseInt(data.pointsAwarded.toString(), 10),
    },
  };
};

export function fetchAllExperiencePointsRecord(
  studentId?: number,
  pageNum: number = 1,
): Operation {
  return async (dispatch) =>
    CourseAPI.experiencePointsRecord
      .fetchAllExp({ pageNum, studentId })
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveExperiencePointsRecordList({
            rowCount: data.rowCount,
            records: data.records,
            filters: data.filters,
            studentName: undefined,
          }),
        );
      });
}

export function fetchUserExperiencePointsRecord(
  studentId: number,
  pageNum: number = 1,
): Operation {
  return async (dispatch) =>
    CourseAPI.experiencePointsRecord
      .fetchExpForUser(studentId, pageNum)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveExperiencePointsRecordList({
            rowCount: data.rowCount,
            records: data.records,
            filters: undefined,
            studentName: data.studentName,
          }),
        );
      });
}

export function updateExperiencePointsRecord(
  data: ExperiencePointsRowData,
  studentId: number,
): Operation<ExperiencePointsRecordListData> {
  const params: UpdateExperiencePointsRecordPatchData =
    formatUpdateExperiencePointsRecord(data);

  return async (dispatch) =>
    CourseAPI.experiencePointsRecord
      .update(params, data.id, studentId)
      .then((response) => {
        dispatch(actions.updateExperiencePointsRecord({ data: response.data }));
        return response.data;
      });
}

export function deleteExperiencePointsRecord(
  recordId: number,
  studentId: number,
): Operation {
  return async (dispatch) =>
    CourseAPI.experiencePointsRecord.delete(recordId, studentId).then(() => {
      dispatch(actions.deleteExperiencePointsRecord({ id: recordId }));
    });
}

export const downloadExperiencePoints = (
  handleSuccess: (successData: JobCompleted) => void,
  handleFailure: (error: JobErrored | AxiosError) => void,
  studentId?: number,
): void => {
  CourseAPI.experiencePointsRecord
    .downloadCSV(studentId)
    .then((response) => {
      pollJob(
        response.data.jobUrl,
        handleSuccess,
        handleFailure,
        DOWNLOAD_JOB_POLL_INTERVAL_MS,
      );
    })
    .catch(handleFailure);
};
