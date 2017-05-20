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
    return this.getClient().post(`${this._getUrlPrefix()}/${submissionQuestionId}/comments`, params);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/assessments/${this.getAssessmentId()}/submission_questions`;
  }
}
