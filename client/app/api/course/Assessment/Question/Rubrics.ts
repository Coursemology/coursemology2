import {
  RubricAnswerData,
  RubricData,
  RubricEvaluationData,
} from 'types/course/rubrics';

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

  evaluateMockAnswer(
    rubricId: number,
    mockAnswerId: number,
  ): APIResponse<RubricEvaluationData> {
    return this.client.post(
      `${this.#urlPrefix}/${rubricId}/mock_answer_evaluations`,
      { mock_answer_id: mockAnswerId },
    );
  }

  evaluateAnswer(
    rubricId: number,
    answerId: number,
  ): APIResponse<RubricEvaluationData> {
    return this.client.post(
      `${this.#urlPrefix}/${rubricId}/answer_evaluations`,
      { answer_id: answerId },
    );
  }
}
