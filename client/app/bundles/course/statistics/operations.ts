import { AxiosError } from 'axios';
import { JobCompleted, JobErrored } from 'types/jobs';

import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/jobHelpers';

import {
  AssessmentsStatistics,
  CoursePerformanceStatistics,
  CourseProgressionStatistics,
  GetHelpStatistics,
  StaffStatistics,
  StatisticsIndexData,
  StudentsStatistics,
} from './types';

const DOWNLOAD_JOB_POLL_INTERVAL_MS = 2000;

export const fetchStatisticsIndex = async (): Promise<StatisticsIndexData> => {
  const response = await CourseAPI.statistics.course.fetchStatisticsIndex();
  return response.data;
};

export const fetchStudentStatistics = async (): Promise<StudentsStatistics> => {
  const response =
    await CourseAPI.statistics.course.fetchAllStudentStatistics();

  return response.data;
};

export const fetchStaffStatistics = async (): Promise<StaffStatistics> => {
  const response = await CourseAPI.statistics.course.fetchAllStaffStatistics();
  return response.data;
};

export const fetchCourseProgressionStatistics =
  async (): Promise<CourseProgressionStatistics> => {
    const response =
      await CourseAPI.statistics.course.fetchCourseProgressionStatistics();
    return response.data;
  };

export const fetchCoursePerformanceStatistics =
  async (): Promise<CoursePerformanceStatistics> => {
    const response =
      await CourseAPI.statistics.course.fetchCoursePerformanceStatistics();
    return response.data;
  };

export const fetchAssessmentsStatistics =
  async (): Promise<AssessmentsStatistics> => {
    const response =
      await CourseAPI.statistics.course.fetchAssessmentsStatistics();
    return response.data;
  };

export const fetchGetHelpStatistics = async (): Promise<GetHelpStatistics> => {
  const response = await CourseAPI.statistics.course.fetchGetHelpStatistics();
  return response.data;
};

export const downloadScoreSummary = (
  handleSuccess: (successData: JobCompleted) => void,
  handleFailure: (error: JobErrored | AxiosError) => void,
  assessmentIds: number[],
): void => {
  CourseAPI.statistics.course
    .downloadScoreSummary(assessmentIds)
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
