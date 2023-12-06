import BaseAssessmentAPI from './Base';

export default class SubmissionQuestionsAPI extends BaseAssessmentAPI {
  /**
   * Creates a comment on a SubmissionQuestion
   *
   * @param {number} submissionQuestionId
   * @return {Promise}
   * success response: comment_with_sanitized_html
   */
  createComment(submissionQuestionId, params) {
    return this.client.post(
      `${this.#urlPrefix}/${submissionQuestionId}/comments`,
      params,
    );
  }

  /**
   * Gets the past answers from a SubmissionQuestion
   *
   * @param {number} submissionQuestionId
   * @return {Promise}
   */
  getPastAnswers(submissionQuestionId) {
    return this.client.get(
      `${this.#urlPrefix}/${submissionQuestionId}/past_answers`,
    );
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/submission_questions`;
  }
}
