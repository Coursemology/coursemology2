import {
  ScholaisticAssessmentEditData,
  ScholaisticAssessmentNewData,
  ScholaisticAssessmentsIndexData,
  ScholaisticAssessmentSubmissionEditData,
  ScholaisticAssessmentSubmissionsIndexData,
  ScholaisticAssessmentUpdatePostData,
  ScholaisticAssessmentViewData,
  ScholaisticAssistantEditData,
  ScholaisticAssistantsIndexData,
} from 'types/course/scholaistic';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class ScholaisticAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/scholaistic`;
  }

  fetchAssessments(): APIResponse<ScholaisticAssessmentsIndexData> {
    return this.client.get(`${this.#urlPrefix}/assessments`);
  }

  fetchAssessment(
    assessmentId: number,
  ): APIResponse<ScholaisticAssessmentViewData> {
    return this.client.get(`${this.#urlPrefix}/assessments/${assessmentId}`);
  }

  updateAssessment(
    assessmentId: number,
    data: ScholaisticAssessmentUpdatePostData,
  ): APIResponse {
    return this.client.patch(
      `${this.#urlPrefix}/assessments/${assessmentId}`,
      data,
    );
  }

  fetchEditAssessment(
    assessmentId: number,
  ): APIResponse<ScholaisticAssessmentEditData> {
    return this.client.get(
      `${this.#urlPrefix}/assessments/${assessmentId}/edit`,
    );
  }

  fetchNewAssessment(): APIResponse<ScholaisticAssessmentNewData> {
    return this.client.get(`${this.#urlPrefix}/assessments/new`);
  }

  fetchSubmissions(
    assessmentId: number,
  ): APIResponse<ScholaisticAssessmentSubmissionsIndexData> {
    return this.client.get(
      `${this.#urlPrefix}/assessments/${assessmentId}/submissions`,
    );
  }

  fetchSubmission(
    assessmentId: number,
    submissionId: string,
  ): APIResponse<ScholaisticAssessmentSubmissionEditData> {
    return this.client.get(
      `${this.#urlPrefix}/assessments/${assessmentId}/submissions/${submissionId}`,
    );
  }

  findOrCreateSubmission(assessmentId: number): APIResponse<{ id: string }> {
    return this.client.get(
      `${this.#urlPrefix}/assessments/${assessmentId}/submission`,
    );
  }

  fetchAssistants(): APIResponse<ScholaisticAssistantsIndexData> {
    return this.client.get(`${this.#urlPrefix}/assistants`);
  }

  fetchAssistant(
    assistantId: string,
  ): APIResponse<ScholaisticAssistantEditData> {
    return this.client.get(`${this.#urlPrefix}/assistants/${assistantId}`);
  }
}
