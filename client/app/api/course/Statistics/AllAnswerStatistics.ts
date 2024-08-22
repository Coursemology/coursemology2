import { QuestionType } from 'types/course/assessment/question';
import { QuestionAllAnswerDisplayDetails } from 'types/course/statistics/assessmentStatistics';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class AllAnswerStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/submission_question`;
  }

  fetchAllAnswers(
    submissionQuestionId: number,
  ): APIResponse<QuestionAllAnswerDisplayDetails<keyof typeof QuestionType>> {
    return this.client.get(`${this.#urlPrefix}/${submissionQuestionId}`);
  }
}
