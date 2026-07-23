import { AxiosRequestConfig } from 'axios';
import { AnswerData } from 'types/course/assessment/submission/answer';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';
import { getActivePreview } from 'course/marketplace/contexts/PreviewContext';

import BaseAPI from '../../Base';
import SubmissionsAPI from '../../Submissions';

export default class AnswersAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/${this.submissionId}/answers`;
  }

  saveDraft(answerId: number, answerData: unknown): APIResponse<AnswerData> {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    const preview = getActivePreview();
    if (preview) {
      return this.#savePreviewDraft(
        preview.courseId,
        preview.submissionId,
        answerId,
        answerData,
        config,
      );
    }

    const formData = new FormData();
    SubmissionsAPI.appendFormData(formData, answerData);

    return this.client.patch(
      `${this.#urlPrefix}/${answerId}`,
      formData,
      config,
    );
  }

  #savePreviewDraft(
    courseId: number,
    submissionId: number,
    answerId: number,
    answerData: unknown,
    config: AxiosRequestConfig<FormData>,
  ): APIResponse<AnswerData> {
    const formData = new FormData();
    const { answer } = answerData as { answer?: unknown };
    SubmissionsAPI.appendFormData(formData, {
      submission: { answers: answer ? [answer] : [] },
    });

    return this.client
      .patch(
        `/courses/${courseId}/marketplace/attempt/${submissionId}`,
        formData,
        config,
      )
      .then((response) => {
        const updatedAnswer = response.data.answers?.find(
          (candidate: AnswerData) => candidate.id === answerId,
        );
        return { ...response, data: updatedAnswer ?? response.data };
      }) as APIResponse<AnswerData>;
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
