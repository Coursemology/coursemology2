import { LiveFeedbackHistoryState } from 'types/course/assessment/submission/liveFeedback';
import {
  AncestorAssessmentStats,
  AncestorInfo,
  AssessmentLiveFeedbackStatistics,
  MainAssessmentInfo,
  MainSubmissionInfo,
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
      `${this.#urlPrefix}/${ancestorId}/ancestor_statistics`,
    );
  }

  fetchAssessmentStatistics(
    assessmentId: string | number,
  ): APIResponse<MainAssessmentInfo | null> {
    return this.client.get(
      `${this.#urlPrefix}/${assessmentId}/assessment_statistics`,
    );
  }

  fetchSubmissionStatistics(
    assessmentId: string | number,
  ): APIResponse<MainSubmissionInfo[]> {
    return this.client.get(
      `${this.#urlPrefix}/${assessmentId}/submission_statistics`,
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
  ): APIResponse<LiveFeedbackHistoryState> {
    return this.client.get(
      `${this.#urlPrefix}/${assessmentId}/live_feedback_history`,
      { params: { question_id: questionId, course_user_id: courseUserId } },
    );
  }

  fetchAncestorInfo(
    assessmentId: number,
  ): Promise<APIResponse<AncestorInfo[]>> {
    return this.client.get(`${this.#urlPrefix}/${assessmentId}/ancestor_info`);
  }
}
