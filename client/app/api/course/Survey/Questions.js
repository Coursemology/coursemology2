import BaseSurveyAPI from './Base';

export default class QuestionsAPI extends BaseSurveyAPI {
  /**
   * survey_question = {
   *   id: number, question_type: string, description: string, max_options: number, ...etc,
   *      - Question attributes
   *      - question_type is one of ['text', 'multiple_choice', 'multiple_response']
   *   canUpdate: bool, canDelete: bool,
   *      - true if user can update and delete question respectively
   *   options: Array.<{ id: number, option: string, image_url: string, ...etc }>,
   *      - Array of options for this question
   * }
   */

  /**
   * Creates a survey question
   *
   * @param {object} questionFields
   *   - params in the format of { question: { :title, :description, :question_type etc } }
   *   - question_type is one of ['text', 'multiple_choice', 'multiple_response']
   * @return {Promise}
   * success response: survey_question
   * error response: { errors: [{ attribute: string }] }
   */
  create(questionFields) {
    return this.getClient().post(this._getUrlPrefix(), questionFields);
  }

  /**
   * Updates a survey question
   *
   * @param {object} questionFields
   *   - params in the format of { question: { :title, :description, :question_type, etc } }
   *   - question_type is one of ['text', 'multiple_choice', 'multiple_response']
   * @return {Promise}
   * success response: survey_question
   * error response: { errors: [{ attribute: string }] }
   */
  update(questionId, questionFields) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${questionId}`,
      questionFields
    );
  }

  /**
   * Deletes a survey question
   *
   * @param {number} questionId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  delete(questionId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${questionId}`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/surveys/${this.getSurveyId()}/questions`;
  }
}
