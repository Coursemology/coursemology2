import { QuestionAnswerDetails } from 'types/course/statistics/assessmentStatistics';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class AnswerStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/answer`;
  }

  fetchQuestionAnswerDetails(
    answerId: number,
  ): APIResponse<QuestionAnswerDetails> {
    return this.client.get(`${this.#urlPrefix}/${answerId}`);
  }
}
