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
   * Can include answers_to_load in params to indicate how many to pull (default 10)
   *
   * @param {number} submissionQuestionId
   * @return {Promise}
   */
  getPastAnswers(submissionQuestionId, answersToLoad = 10) {
    const params = { answers_to_load: answersToLoad };
    return this.client.get(
      `${this.#urlPrefix}/${submissionQuestionId}/past_answers`,
      { params },
    );
  }

  get #urlPrefix() {
    return `/courses/${this.getCourseId()}/assessments/${this.getAssessmentId()}/submission_questions`;
  }
}
