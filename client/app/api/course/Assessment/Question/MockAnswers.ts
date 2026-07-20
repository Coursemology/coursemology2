import {
  RubricMockAnswerData,
  RubricMockAnswerGradingContext,
} from 'types/course/rubrics';

import { APIResponse } from 'api/types';

import BaseAssessmentAPI from '../Base';

const buildMockAnswerPayload = (
  name: string,
  answerText: string,
  gradingContexts: RubricMockAnswerGradingContext[],
): object => ({
  name,
  answer_text: answerText,
  grading_contexts_attributes: gradingContexts.map((context) => ({
    // Send the join row id only for persisted contexts, so nested attributes update in place.
    ...(context.id !== undefined && { id: context.id }),
    grading_context_id: context.gradingContextId,
    content: context.content,
  })),
});

export default class MockAnswersAPI extends BaseAssessmentAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/questions/${this.questionId}/mock_answers`;
  }

  index(): APIResponse<RubricMockAnswerData[]> {
    return this.client.get(this.#urlPrefix);
  }

  create(
    name: string,
    answerText: string,
    gradingContexts: RubricMockAnswerGradingContext[] = [],
  ): APIResponse<RubricMockAnswerData> {
    return this.client.post(this.#urlPrefix, {
      mock_answer: buildMockAnswerPayload(name, answerText, gradingContexts),
    });
  }

  update(
    mockAnswerId: number,
    name: string,
    answerText: string,
    gradingContexts: RubricMockAnswerGradingContext[] = [],
  ): APIResponse<RubricMockAnswerData> {
    return this.client.patch(`${this.#urlPrefix}/${mockAnswerId}`, {
      mock_answer: buildMockAnswerPayload(name, answerText, gradingContexts),
    });
  }

  delete(mockAnswerId: number): APIResponse<void> {
    return this.client.delete(`${this.#urlPrefix}/${mockAnswerId}`);
  }
}
