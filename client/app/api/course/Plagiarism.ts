import {
  AssessmentLinkData,
  AssessmentPlagiarism,
  PlagiarismAssessments,
} from 'types/course/plagiarism';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class PlagiarismAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/plagiarism`;
  }

  /**
   * Fetches all assessments with their plagiarism run status.
   */
  fetchAssessments(): APIResponse<PlagiarismAssessments> {
    return this.client.get(`${this.#urlPrefix}/assessments`);
  }

  /**
   * Fetches assessment plagiarism data (submission pairs with status information).
   */
  fetchAssessmentPlagiarism(
    assessmentId: number,
  ): APIResponse<AssessmentPlagiarism> {
    return this.client.get(`${this.#urlPrefix}/assessments/${assessmentId}`);
  }

  /**
   * Downloads the plagiarism result for a submission pair.
   */
  downloadSubmissionPairResult(
    assessmentId: number,
    submissionPairId: number,
  ): APIResponse<{ html: string }> {
    return this.client.get(
      `${this.#urlPrefix}/assessments/${assessmentId}/download_submission_pair_result`,
      {
        params: { submission_pair_id: submissionPairId },
      },
    );
  }

  /**
   * Shares the plagiarism result for a submission pair.
   */
  shareSubmissionPairResult(
    assessmentId: number,
    submissionPairId: number,
  ): APIResponse<{ url: string }> {
    return this.client.post(
      `${this.#urlPrefix}/assessments/${assessmentId}/share_submission_pair_result`,
      {
        submission_pair_id: submissionPairId,
      },
    );
  }

  /**
   * Shares the assessment plagiarism result.
   */
  shareAssessmentResult(assessmentId: number): APIResponse<{ url: string }> {
    return this.client.post(
      `${this.#urlPrefix}/assessments/${assessmentId}/share_assessment_result`,
    );
  }

  /**
   * Initiates plagiarism check on an assessment.
   */
  runAssessmentPlagiarism(assessmentId: number): APIResponse<JobSubmitted> {
    return this.client.post(`${this.#urlPrefix}/assessments/${assessmentId}`);
  }

  /**
   * Initiates plagiarism checks for multiple assessments.
   */
  runAssessmentsPlagiarism(assessmentIds: number[]): APIResponse<void> {
    return this.client.post(
      `${this.#urlPrefix}/assessments/plagiarism_checks`,
      {
        assessment_ids: assessmentIds,
      },
    );
  }

  /**
   * Fetches linked and unlinked assessments for a given assessment.
   */
  fetchLinkedAndUnlinkedAssessments(
    assessmentId: number,
  ): APIResponse<AssessmentLinkData> {
    return this.client.get(
      `${this.#urlPrefix}/assessments/${assessmentId}/linked_and_unlinked_assessments`,
    );
  }

  /**
   * Updates the linked assessments for a given assessment.
   */
  updateAssessmentLinks(
    assessmentId: number,
    linkedAssessmentIds: number[],
  ): APIResponse<void> {
    return this.client.patch(
      `${this.#urlPrefix}/assessments/${assessmentId}/update_assessment_links`,
      {
        linked_assessment_ids: linkedAssessmentIds,
      },
    );
  }
}
