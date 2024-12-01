import { QuestionType } from 'types/course/assessment/question';
import { AnswerStatisticsData } from 'types/course/statistics/assessmentStatistics';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class AnswerStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/answers`;
  }

  fetch(
    answerId: number,
  ): APIResponse<AnswerStatisticsData<keyof typeof QuestionType>> {
    return this.client.get(`${this.#urlPrefix}/${answerId}`);
  }
}
