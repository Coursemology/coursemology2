import {
  AssessmentStatistics,
  AssessmentStatisticsStats,
} from 'types/course/statistics/assessmentStatistics';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

// Contains individual assessment-level statistics.
export default class AssessmentStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/assessment`;
  }

  /**
   * Fetches the statistics for a specific individual assessment.
   *
   * This is used both for an assessment and for its ancestors.
   */
  fetchStatistics(
    assessmentId: string | number,
  ): APIResponse<AssessmentStatistics> {
    return this.client.get(`${this.#urlPrefix}/${assessmentId}`);
  }

  fetchAssessmentStatistics(
    assessmentId: string | number,
  ): APIResponse<AssessmentStatisticsStats> {
    return this.client.get(
      `${this.#urlPrefix}/${assessmentId}/assessment_statistics`,
    );
  }
}
