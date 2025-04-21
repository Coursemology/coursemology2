import { SubmissionQuestionDetails } from 'types/course/assessment/submission/submission-question';

import { APIResponse } from 'api/types';

import BaseAssessmentAPI from './Base';

export default class AllAnswersAPI extends BaseAssessmentAPI {
  fetchSubmissionQuestionDetails(
    submissionId: number,
    questionId: number,
  ): APIResponse<SubmissionQuestionDetails> {
    return this.client.get(
      `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/${submissionId}/questions/${questionId}/all_answers`,
    );
  }
}
