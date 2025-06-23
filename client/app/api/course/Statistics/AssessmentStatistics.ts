import { LiveFeedbackHistoryState } from 'types/course/assessment/submission/liveFeedback';
import {
  AncestorAssessmentStats,
  AssessmentLiveFeedbackStatistics,
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

  fetchLiveFeedbackStatistics(
    assessmentId: number,
  ): APIResponse<AssessmentLiveFeedbackStatistics[]> {
    return this.client.get(
      `${this.#urlPrefix}/${assessmentId}/live_feedback_statistics`,
    );
  }

  fetchLiveFeedbackHistory(
    assessmentId: string | number,
    questionId: string | number,
    courseUserId: string | number,
    courseId?: string | number, // Optional, only used for system and instance admin context
  ): APIResponse<LiveFeedbackHistoryState> {
    const actualCourseId = this.courseId || courseId;
    const urlPrefix = `/courses/${actualCourseId}/statistics/assessment`;
    return this.client.get(
      `${urlPrefix}/${assessmentId}/live_feedback_history`,
      { params: { question_id: questionId, course_user_id: courseUserId } },
    );
  }
}
