import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';
import {
  AssessmentsStatistics,
  CourseGetHelpActivity,
  CoursePerformanceStatistics,
  CourseProgressionStatistics,
  StaffStatistics,
  StudentsStatistics,
} from 'course/statistics/types';

import BaseCourseAPI from '../Base';

interface StatisticsIndexData {
  codaveriComponentEnabled: boolean;
}

export default class CourseStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics`;
  }

  fetchStatisticsIndex(): APIResponse<StatisticsIndexData> {
    return this.client.get(`${this.#urlPrefix}`);
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

  fetchCourseGetHelpActivity(params?: {
    start_at: string;
    end_at: string;
  }): APIResponse<CourseGetHelpActivity[]> {
    return this.client.get(`${this.#urlPrefix}/get_help`, {
      params,
    });
  }

  downloadScoreSummary(assessmentIds: number[]): APIResponse<JobSubmitted> {
    return this.client.get(`${this.#urlPrefix}/assessments/download`, {
      params: { assessment_ids: assessmentIds },
    });
  }
}
