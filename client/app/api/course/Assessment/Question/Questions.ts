import { QuestionBaseData } from 'types/course/assessment/questions';

import { APIResponse } from 'api/types';

import BaseAssessmentAPI from '../Base';

export default class QuestionsAPI extends BaseAssessmentAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/questions`;
  }

  fetch(questionId: number): APIResponse<QuestionBaseData> {
    return this.client.get(`${this.#urlPrefix}/${questionId}`);
  }
}
