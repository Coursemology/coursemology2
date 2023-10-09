import { defineMessages } from 'react-intl';
import { AxiosError } from 'axios';
import { AppDispatch, Operation } from 'store';
import {
  ExperiencePointsRowData,
  UpdateExperiencePointsRecordPatchData,
} from 'types/course/experiencePointsRecords';
import { JobCompleted, JobErrored } from 'types/jobs';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import pollJob from 'lib/helpers/jobHelpers';

import { actions } from './store';
import {
  DeleteExperiencePointsRecordAction,
  UpdateExperiencePointsRecordAction,
} from './types';

const DOWNLOAD_JOB_POLL_INTERVAL_MS = 2000;

const translations = defineMessages({
  downloadRequestSuccess: {
    id: 'course.experiencePoints.downloadRequestSuccess',
    defaultMessage: 'Your request to download is successful',
  },
  downloadFailure: {
    id: 'course.experiencePoints.downloadFailure',
    defaultMessage: 'An error occurred while doing your request for download.',
  },
  downloadPending: {
    id: 'course.experiencePoints.downloadPending',
    defaultMessage:
      'Please wait as your request to download is being processed.',
  },
});

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
      .indexAll(studentId, pageNum)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveExperiencePointsRecordList(
            data.rowCount,
            data.records,
            data.filters,
            undefined,
          ),
        );
      });
}

export function fetchUserExperiencePointsRecord(
  studentId: number,
  pageNum: number = 1,
): Operation {
  return async (dispatch) =>
    CourseAPI.experiencePointsRecord
      .index(studentId, pageNum)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveExperiencePointsRecordList(
            data.rowCount,
            data.records,
            undefined,
            data.studentName,
          ),
        );
      });
}

export function updateExperiencePointsRecord(
  data: ExperiencePointsRowData,
  studentId?: number,
): Operation<UpdateExperiencePointsRecordAction> {
  const params: UpdateExperiencePointsRecordPatchData =
    formatUpdateExperiencePointsRecord(data);

  return async (dispatch) =>
    CourseAPI.experiencePointsRecord
      .update(params, data.id, studentId)
      .then((response) =>
        dispatch(actions.updateExperiencePointsRecord(response.data)),
      );
}

export function deleteExperiencePointsRecord(
  recordId: number,
  studentId?: number,
): Operation<DeleteExperiencePointsRecordAction> {
  return async (dispatch) =>
    CourseAPI.experiencePointsRecord
      .delete(recordId, studentId)
      .then(() => dispatch(actions.deleteExperiencePointsRecord(recordId)));
}

export const downloadExperiencePoints = (
  dispatch: AppDispatch,
  studentId?: number,
): void => {
  const handleSuccess = (successData: JobCompleted): void => {
    window.location.href = successData.redirectUrl!;
    dispatch(actions.downloadExperiencePointsSuccess);
    dispatch(setNotification(translations.downloadRequestSuccess));
  };

  const handleFailure = (error: JobErrored | AxiosError): void => {
    const message = error?.message || translations.downloadFailure;
    dispatch(actions.downloadExperiencePointsFailure);
    dispatch(setNotification(message));
  };

  CourseAPI.experiencePointsRecord
    .download(studentId)
    .then((response) => {
      dispatch(setNotification(translations.downloadPending));
      pollJob(
        response.data.jobUrl,
        handleSuccess,
        handleFailure,
        DOWNLOAD_JOB_POLL_INTERVAL_MS,
      );
    })
    .catch(handleFailure);
};
