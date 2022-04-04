import {
  AssessmentAncestors,
  AssessmentStatistis,
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
  ): APIResponse<AssessmentStatistis> {
    return this.client.get(`${this.#urlPrefix}/${assessmentId}`);
  }

  /**
   * Fetches the ancestors for a specific individual assessment.
   */
  fetchAncestors(
    assessmentId: string | number,
  ): APIResponse<AssessmentAncestors> {
    return this.client.get(`${this.#urlPrefix}/${assessmentId}/ancestors`);
  }
}
