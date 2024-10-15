import { QuestionType } from 'types/course/assessment/question';
import {
  LatestAttempt,
  QuestionAnswerDetails,
} from 'types/course/statistics/assessmentStatistics';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class AnswerStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/answer`;
  }

  fetchAttempts(
    answerId: number,
    limit: number,
  ): APIResponse<QuestionAnswerDetails<keyof typeof QuestionType>> {
    return this.client.get(`${this.#urlPrefix}/${answerId}`, {
      params: {
        limit,
      },
    });
  }

  fetchLatestAttempt(
    answerId: number,
  ): APIResponse<LatestAttempt<keyof typeof QuestionType>> {
    return this.client.get(`${this.#urlPrefix}/${answerId}/latest_attempt`);
  }
}
