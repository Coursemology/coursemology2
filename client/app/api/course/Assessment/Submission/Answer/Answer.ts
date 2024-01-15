import { APIResponse } from 'api/types';

import BaseAPI from '../../Base';
import SubmissionsAPI from '../../Submissions';

export default class AnswersAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/${this.submissionId}/answers`;
  }

  saveDraft(answerId: number, answerData: unknown): APIResponse {
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

  submitAnswer(answerId: number, answerData: unknown): APIResponse {
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
