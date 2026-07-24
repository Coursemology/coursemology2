import { AnswerData } from 'types/course/assessment/submission/answer';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';

import BaseAPI from '../../Base';
import { getActivePreview } from '../../previewAttemptContext';
import SubmissionsAPI from '../../Submissions';

export default class AnswersAPI extends BaseAPI {
  get #urlPrefix(): string {
    // See Submissions.js#urlPrefix. A marketplace preview URL has no /assessments/:aid
    // segment, so per-answer save/submit must route to the shallow attempt endpoint; the
    // attempt id (this.submissionId, resolved from the preview URL) stands in as the
    // submission id. The `assessmentId === null` disjunct survives a stray poller firing
    // after the singleton was cleared, so it never emits /assessments/null/... .
    if (getActivePreview() !== null || this.assessmentId === null) {
      return `/courses/${this.courseId}/marketplace/attempt/${this.submissionId}/answers`;
    }
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/${this.submissionId}/answers`;
  }

  saveDraft(answerId: number, answerData: unknown): APIResponse<AnswerData> {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    const formData = new FormData();
    SubmissionsAPI.appendFormData(formData, answerData);

    return this.client.patch(
      `${this.#urlPrefix}/${answerId}`,
      formData,
      config,
    );
  }

  submitAnswer(
    answerId: number,
    answerData: unknown,
  ): APIResponse<JobSubmitted | AnswerData> {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    const formData = new FormData();
    SubmissionsAPI.appendFormData(formData, answerData);

    return this.client.patch(
      `${this.#urlPrefix}/${answerId}/submit_answer`,
      formData,
      config,
    );
  }
}
