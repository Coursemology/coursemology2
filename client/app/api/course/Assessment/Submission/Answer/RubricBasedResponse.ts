import { APIResponse } from 'api/types';

import BaseAssessmentAPI from '../../Base';

export default class RubricBasedResponseAPI extends BaseAssessmentAPI {
  updateScore(answerId: number, id: number, score: number): APIResponse {
    return this.client.patch(
      `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/\
        ${this.submissionId}/answers/${answerId}/rubric_based_response/update_score`,
      { category_score: { id, score } },
    );
  }

  updateExplanation(
    answerId: number,
    id: number,
    explanation: string,
  ): APIResponse {
    return this.client.patch(
      `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/\
        ${this.submissionId}/answers/${answerId}/rubric_based_response/update_explanation`,
      { category_explanation: { id, explanation } },
    );
  }
}
