import CourseAPI from 'api/course';

import {
  AssessmentsStatistics,
  CoursePerformanceStatistics,
  CourseProgressionStatistics,
  StaffStatistics,
  StudentsStatistics,
} from './types';

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
