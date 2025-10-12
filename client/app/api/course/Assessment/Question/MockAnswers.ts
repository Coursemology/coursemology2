import { RubricAnswerData } from 'types/course/rubrics';

import { APIResponse } from 'api/types';

import BaseAssessmentAPI from '../Base';

export default class MockAnswersAPI extends BaseAssessmentAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/questions/${this.questionId}/mock_answers`;
  }

  index(): APIResponse<RubricAnswerData[]> {
    return this.client.get(this.#urlPrefix);
  }

  create(answerText: string): APIResponse<{ id: number }> {
    return this.client.post(this.#urlPrefix, {
      mock_answer: { answer_text: answerText },
    });
  }
}
