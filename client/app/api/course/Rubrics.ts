import { RubricData } from 'types/course/rubrics';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class RubricsAPI extends BaseCourseAPI {
  #getUrlPrefix(id?: RubricData['id']): string {
    return `/courses/${this.courseId}/rubrics${id ? `/${id}` : ''}`;
  }

  indexForQuestion(questionId: number): APIResponse<{ rubrics: RubricData[] }> {
    return this.client.get(this.#getUrlPrefix(), {
      params: { question_id: questionId },
    });
  }

  delete(id: RubricData['id']): APIResponse {
    return this.client.delete(`${this.#getUrlPrefix(id)}`);
  }
}
