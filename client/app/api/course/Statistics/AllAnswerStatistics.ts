import { SubmissionQuestionDetails } from 'types/course/assessment/submission/submission-question';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class AllAnswerStatisticsAPI extends BaseCourseAPI {
  fetchSubmissionQuestionDetails(
    submissionId: number,
    questionId: number,
  ): APIResponse<SubmissionQuestionDetails> {
    return this.client.get(
      `/courses/${this.courseId}/statistics/submissions/${submissionId}/questions/${questionId}`,
    );
  }
}
