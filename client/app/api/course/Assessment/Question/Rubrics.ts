import {
  RubricAnswerData,
  RubricAnswerEvaluationData,
  RubricData,
  RubricMockAnswerEvaluationData,
  RubricPostRequestData,
} from 'types/course/rubrics';
import { JobStatusResponse } from 'types/jobs';

import { APIResponse } from 'api/types';

import BaseAssessmentAPI from '../Base';

export default class RubricsAPI extends BaseAssessmentAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/questions/${this.questionId}/rubrics`;
  }

  index(): APIResponse<RubricData[]> {
    return this.client.get(this.#urlPrefix);
  }

  answers(): APIResponse<RubricAnswerData[]> {
    return this.client.get(`${this.#urlPrefix}/answers`);
  }

  create(data: RubricPostRequestData): APIResponse<RubricData> {
    return this.client.post(`${this.#urlPrefix}`, data);
  }

  delete(rubricId: number): APIResponse {
    return this.client.delete(`${this.#urlPrefix}/${rubricId}`);
  }

  evaluateMockAnswer(
    rubricId: number,
    mockAnswerId: number,
  ): APIResponse<RubricMockAnswerEvaluationData> {
    return this.client.post(
      `${this.#urlPrefix}/${rubricId}/mock_answer_evaluations`,
      { mock_answer_id: mockAnswerId },
    );
  }

  evaluateAnswer(
    rubricId: number,
    answerId: number,
  ): APIResponse<RubricAnswerEvaluationData> {
    return this.client.post(
      `${this.#urlPrefix}/${rubricId}/answer_evaluations`,
      { answer_id: answerId },
    );
  }

  initializeAnswerEvaluations(
    rubricId: number,
    answerIds: number[],
  ): APIResponse<RubricAnswerEvaluationData[]> {
    return this.client.post(
      `${this.#urlPrefix}/${rubricId}/answer_evaluations/initialize`,
      { answer_ids: answerIds },
    );
  }

  initializeMockAnswerEvaluations(
    rubricId: number,
    mockAnswerIds: number[],
  ): APIResponse<RubricMockAnswerEvaluationData[]> {
    return this.client.post(
      `${this.#urlPrefix}/${rubricId}/mock_answer_evaluations/initialize`,
      { mock_answer_ids: mockAnswerIds },
    );
  }

  fetchAnswerEvaluations(
    rubricId: number,
  ): APIResponse<RubricAnswerEvaluationData[]> {
    return this.client.get(`${this.#urlPrefix}/${rubricId}/answer_evaluations`);
  }

  fetchMockAnswerEvaluations(
    rubricId: number,
  ): APIResponse<RubricMockAnswerEvaluationData[]> {
    return this.client.get(
      `${this.#urlPrefix}/${rubricId}/mock_answer_evaluations`,
    );
  }

  deleteAnswerEvaluation(
    rubricId: number,
    answerId: number,
  ): APIResponse<void> {
    return this.client.delete(
      `${this.#urlPrefix}/${rubricId}/answer_evaluations/${answerId}`,
    );
  }

  deleteMockAnswerEvaluation(
    rubricId: number,
    mockAnswerId: number,
  ): APIResponse<void> {
    return this.client.delete(
      `${this.#urlPrefix}/${rubricId}/mock_answer_evaluations/${mockAnswerId}`,
    );
  }

  exportEvaluations(rubricId: number): APIResponse<JobStatusResponse> {
    return this.client.post(`${this.#urlPrefix}/${rubricId}/export`);
  }
}
