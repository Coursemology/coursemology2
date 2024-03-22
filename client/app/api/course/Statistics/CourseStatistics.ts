import { APIResponse } from 'api/types';
import {
  AssessmentsStatistics,
  CoursePerformanceStatistics,
  CourseProgressionStatistics,
  StaffStatistics,
  StudentsStatistics,
  SubmissionTimeStatistics,
} from 'course/statistics/types';

import BaseCourseAPI from '../Base';

export default class CourseStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics`;
  }

  fetchAllStudentStatistics(): APIResponse<StudentsStatistics> {
    return this.client.get(`${this.#urlPrefix}/students`);
  }

  fetchAllStaffStatistics(): APIResponse<StaffStatistics> {
    return this.client.get(`${this.#urlPrefix}/staff`);
  }

  fetchCourseProgressionStatistics(): APIResponse<CourseProgressionStatistics> {
    return this.client.get(`${this.#urlPrefix}/course/progression`);
  }

  fetchCoursePerformanceStatistics(): APIResponse<CoursePerformanceStatistics> {
    return this.client.get(`${this.#urlPrefix}/course/performance`);
  }

  fetchAssessmentsStatistics(): APIResponse<AssessmentsStatistics> {
    return this.client.get(`${this.#urlPrefix}/assessments`);
  }

  fetchSubmissionTimeStatistics(
    studentId: number,
  ): APIResponse<SubmissionTimeStatistics> {
    return this.client.get(`${this.#urlPrefix}/submission_time`, {
      params: { student_id: studentId },
    });
  }
}
