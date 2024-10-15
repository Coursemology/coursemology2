import { QuestionType } from 'types/course/assessment/question';
import { QuestionAllAnswerDetails } from 'types/course/statistics/assessmentStatistics';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class AllAnswerStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/submission_question`;
  }

  fetchAllAttempts(
    submissionQuestionId: number,
  ): APIResponse<QuestionAllAnswerDetails<keyof typeof QuestionType>> {
    return this.client.get(`${this.#urlPrefix}/${submissionQuestionId}`);
  }
}
