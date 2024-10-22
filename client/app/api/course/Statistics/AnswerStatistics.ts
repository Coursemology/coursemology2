import { QuestionType } from 'types/course/assessment/question';
import {
  LatestAnswer,
  QuestionAnswerDetails,
} from 'types/course/statistics/assessmentStatistics';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class AnswerStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/answer`;
  }

  fetchQuestionAnswerDetails(
    answerId: number,
  ): APIResponse<QuestionAnswerDetails<keyof typeof QuestionType>> {
    return this.client.get(`${this.#urlPrefix}/${answerId}`);
  }

  fetchLatestAnswer(
    answerId: number,
  ): APIResponse<LatestAnswer<keyof typeof QuestionType>> {
    return this.client.get(`${this.#urlPrefix}/${answerId}/latest_answer`);
  }
}
