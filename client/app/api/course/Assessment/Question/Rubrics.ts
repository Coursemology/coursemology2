import { RubricAnswerData, RubricData } from 'types/course/rubrics';

import { APIResponse } from 'api/types';

import BaseAssessmentAPI from '../Base';

export default class RubricsAPI extends BaseAssessmentAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/questions/${this.questionId}/rubrics`;
  }

  index(): APIResponse<{ rubrics: RubricData[] }> {
    return this.client.get(this.#urlPrefix);
  }

  answers(): APIResponse<RubricAnswerData[]> {
    return this.client.get(`${this.#urlPrefix}/answers`);
  }
}
