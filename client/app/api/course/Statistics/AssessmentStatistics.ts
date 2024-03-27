import {
  AncestorAssessmentStats,
  MainAssessmentStats,
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
  fetchAncestorStatistics(
    ancestorId: string | number,
  ): APIResponse<AncestorAssessmentStats> {
    return this.client.get(
      `${this.#urlPrefix}/${ancestorId}/ancestor_statistics/`,
    );
  }

  fetchMainStatistics(
    assessmentId: string | number,
  ): APIResponse<MainAssessmentStats> {
    return this.client.get(
      `${this.#urlPrefix}/${assessmentId}/main_statistics`,
    );
  }
}
