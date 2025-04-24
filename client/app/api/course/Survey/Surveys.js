import BaseSurveyAPI from './Base';

export default class SurveysAPI extends BaseSurveyAPI {
  /**
   * survey_with_questions = {
   *   id: number, title: string, description: string, start_at: datetime, ...etc
   *      - Survey attributes
   *   canCreateSection: bool,
   *      - true if user can create sections for this survey
   *   canManage: bool,
   *      - true if user can manage this survey
   *   canUpdate: bool, canDelete: bool,
   *      - true if user can update and delete this survey respectively
   *    has_todo: bool,
   *      - true if the survey should be included in the todo list
   *   allow_response_after_end: bool,
   *      - true if user can respond to a survey after it expires
   *   allow_modify_after_submit: bool,
   *      - true if user can update survey after it has been submitted
   *   hasStudentResponse: bool,
   *      - true if there is at least one student response for the survey
   *   response: Array.<{ id: number, submitted_at: string, canModify: bool, canSubmit: bool }>
   *      - Response details if it exists. Otherwise, null.
   *   sections:
   *     Array.<{
   *       id: number, title: string, weight: number, ...etc
   *         - Section attributes
   *       questions: Array.<{ description: string, options: Array, question_type: string, ...etc }>,
   *          - Array of questions belonging to the survey
   *          - question_type is one of ['text', 'multiple_choice', 'multiple_response']
   *     }>
   * }
   */

  /**
   * Fetches a Survey
   *
   * @param {number} surveyId
   * @return {Promise}
   * success response: survey_with_questions
   */
  fetch(surveyId) {
    return this.client.get(`${this.#urlPrefix}/${surveyId}`);
  }

  /**
   * Fetches all surveys for the course accessible by the current user.
   *
   * @return {Promise}
   * success response: {
   *   canCreate: bool,
   *     - true if user can create a survey
   *   surveys:Array.<{ id: number, title: string, ...etc }>
   *     - Array of surveys without full questions details
   * }
   */
  index() {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Creates a Survey
   *
   * @param {object} surveyFields - params in the format of { survey: { :title, :description, etc } }
   * @return {Promise}
   * success response: survey_with_questions
   * error response: { errors: [{ attribute: string }] }
   */
  create(surveyFields) {
    return this.client.post(this.#urlPrefix, surveyFields);
  }

  /**
   * Updates a Survey
   *
   * @param {number} surveyId
   * @param {object} surveyFields - params in the format of { survey: { :title, :description, etc } }
   * @return {Promise}
   * success response: survey_with_questions
   * error response: { errors: [{ attribute: string }] }
   */
  update(surveyId, surveyFields) {
    return this.client.patch(`${this.#urlPrefix}/${surveyId}`, surveyFields);
  }

  /**
   * Deletes a Survey
   *
   * @param {number} surveyId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  delete(surveyId) {
    return this.client.delete(`${this.#urlPrefix}/${surveyId}`);
  }

  /**
   * Shows a Survey's results
   *
   * @param {number} surveyId
   * @return {Promise}
   * success response: {
   *   sections: Array.<{
   *     questions: Array.<{
   *       description: string, options: Array, question_type: string, options: Array, ...etc
   *         - Question attributes
   *       answers: Array.<{
   *         id: number, course_user_name: string, course_user_id: number, phantom: bool,
   *         response_path: string,
   *         text_response: string
   *           - included only if it is a text response question
   *         question_option_ids: Array.<number>
   *           - included only if it is a multiple choice or multiple response question
   *       }>
   *     }>
   *   }>
   *   survey: { id: number, title: string, description: string, start_at: datetime, ...etc }
   *     - Survey attributes
   * }
   * error response: {}
   */
  results(surveyId) {
    return this.client.get(`${this.#urlPrefix}/${surveyId}/results`);
  }

  /**
   * Sends emails to remind students to complete the survey.
   *
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  remind(courseUsers) {
    return this.client.post(`${this.#urlPrefix}/${this.getSurveyId()}/remind`, {
      course_users: courseUsers,
    });
  }

  /**
   * Updates the ordering of questions within the survey.
   *
   * @param {Array.<Array.<number, Array.<number>>>} ordering
   *    Each inner (second level) array contains two elements: a section_id and an ordered array
   *    of question_ids for that section.
   * @return {Promise}
   * success response: survey_with_questions
   * error response: {}
   */
  reorderQuestions(ordering) {
    return this.client.post(
      `${this.#urlPrefix}/${this.getSurveyId()}/reorder_questions`,
      ordering,
    );
  }

  /**
   * Updates the ordering of sections within the survey.
   *
   * @param {Array.<number>} ordering Ordered list of section ids
   * @return {Promise}
   * success response: survey_with_questions
   * error response: {}
   */
  reorderSections(ordering) {
    return this.client.post(
      `${this.#urlPrefix}/${this.getSurveyId()}/reorder_sections`,
      ordering,
    );
  }

  download() {
    return this.client.get(`${this.#urlPrefix}/${this.getSurveyId()}/download`);
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/surveys`;
  }
}
