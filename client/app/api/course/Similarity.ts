import {
  AssessmentSimilarity,
  SimilarityAssessments,
} from 'types/course/similarity';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class SimilarityAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/similarity`;
  }

  /**
   * Fetches all assessments with their similarity run status.
   */
  fetchAssessments(): APIResponse<SimilarityAssessments> {
    return this.client.get(`${this.#urlPrefix}/assessments`);
  }

  /**
   * Fetches assessment similarity data (submission pairs with status information).
   */
  fetchAssessmentSimilarity(
    assessmentId: number,
  ): APIResponse<AssessmentSimilarity> {
    return this.client.get(`${this.#urlPrefix}/assessment/${assessmentId}`);
  }

  /**
   * Downloads the similarity result for a submission pair.
   */
  downloadSubmissionPairResult(
    assessmentId: number,
    submissionPairId: number,
  ): APIResponse<{ html: string }> {
    return this.client.get(
      `${this.#urlPrefix}/assessment/${assessmentId}/download_submission_pair_result`,
      {
        params: { submission_pair_id: submissionPairId },
      },
    );
  }

  /**
   * Shares the similarity result for a submission pair.
   */
  shareSubmissionPairResult(
    assessmentId: number,
    submissionPairId: number,
  ): APIResponse<{ url: string }> {
    return this.client.post(
      `${this.#urlPrefix}/assessment/${assessmentId}/share_submission_pair_result`,
      {
        submission_pair_id: submissionPairId,
      },
    );
  }

  /**
   * Shares the assessment similarity result.
   */
  shareAssessmentResult(assessmentId: number): APIResponse<{ url: string }> {
    return this.client.post(
      `${this.#urlPrefix}/assessment/${assessmentId}/share_assessment_result`,
    );
  }

  /**
   * Initiates similarity check on an assessment.
   */
  runAssessmentSimilarity(assessmentId: number): APIResponse<JobSubmitted> {
    return this.client.post(`${this.#urlPrefix}/assessment/${assessmentId}`);
  }

  /**
   * Initiates similarity checks for multiple assessments.
   */
  runAssessmentsSimilarity(assessmentIds: number[]): APIResponse<void> {
    return this.client.post(
      `${this.#urlPrefix}/assessments/similarity_checks`,
      {
        assessment_ids: assessmentIds,
      },
    );
  }
}
