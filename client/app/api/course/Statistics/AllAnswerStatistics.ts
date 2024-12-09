import { SubmissionQuestionDetails } from 'types/course/statistics/assessmentStatistics';

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
