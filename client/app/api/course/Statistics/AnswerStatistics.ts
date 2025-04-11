import { QuestionType } from 'types/course/assessment/question';

import { APIResponse } from 'api/types';
import { AnswerDataWithQuestion } from 'course/assessment/submission/types';

import BaseCourseAPI from '../Base';

export default class AnswerStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/answers`;
  }

  fetch(
    answerId: number,
  ): APIResponse<AnswerDataWithQuestion<keyof typeof QuestionType>> {
    return this.client.get(`${this.#urlPrefix}/${answerId}`);
  }
}
