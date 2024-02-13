import { AnswerDetails } from 'types/course/statistics/assessmentStatistics';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class AnswerStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/answer`;
  }

  fetchAnswerDetails(answerId: number): APIResponse<AnswerDetails> {
    return this.client.get(`${this.#urlPrefix}/${answerId}`);
  }
}
