import { RubricData } from 'types/course/rubrics';

import { APIResponse } from 'api/types';

import BaseAssessmentAPI from '../Base';

export default class RubricsAPI extends BaseAssessmentAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/questions/${this.questionId}/rubrics`;
  }

  index(): APIResponse<RubricData[]> {
    return this.client.get(this.#urlPrefix);
  }
}
