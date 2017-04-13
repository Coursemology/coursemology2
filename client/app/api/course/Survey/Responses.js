import BaseSurveyAPI from './Base';

export default class ResponsesAPI extends BaseSurveyAPI {
  /**
  * survey_response = {
  *   survey: {
  *     id: number, title: string, description: string, start_at: datetime, ...etc,
  *       - Survey attributes
  *   },
  *   response: {
  *     id: number, submitted_at: datetime, creator_name: string
  *       - Response Attributes
  *     sections:
  *       Array.<{
  *         id: number, title: string, weight: number, ...etc,
  *           - Section attributes
  *         answers:
  *           Array.<{
  *             present: bool,
  *               - true if an answer object has been created for the nested question.
  *             id: number, text_response: string, options: Array, ...etc,
  *               - Answer attributes, if the answer exists
  *             questions: Array.<{
  *               description: string, options: Array, weight: number, ...etc
  *                 - Array of questions belonging to the survey
  *               question_type: string,
  *                 - question_type is one of ['text', 'multiple_choice', 'multiple_response']
  *             }>,
  *           }>
  *       }>
  *   },
  *   flags: {
  *     canModify: bool, canSubmit: bool, canUnsubmit: bool, isResponseCreator: bool,
  *       - Flags that define actions user can perform
  *   },
  * }
  */

  /**
  * Fetches a survey response
  *
  * @param {number} responseId
  * @return {Promise}
  * success response: survey_response
  * error response: {}
  */
  fetch(responseId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${responseId}/edit`);
  }

  /**
  * Fetches all student responses for the current survey
  *
  * @return {Promise}
  * success response: {
  *   responses: Array.<{
  *     started: bool, submitted_at: string, path: string,
  *     course_user: { id: number, name: string, phantom: bool, path: string },
  *   }>,
  *     - Expect responses to be sorted by course_user name
  *   survey: { id: number, title: string, ...etc }
  * }
  * error response: {}
  */
  index() {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
  * Creates a blank survey response
  *
  * @param {number} surveyId
  * @return {Promise}
  * success response: survey_response
  * error response:
  *   { responseId: number } if user has an existing survey response
  *   { error: string } if there is some other error
  */
  create(surveyId) {
    return this.getClient().post(this._getUrlPrefix(surveyId));
  }

  /**
  * Updates a survey response
  *
  * @param {number} responseId
  * @param {object} responseFields - params in the format of
  *   {
  *     response: {
  *       answers_attributes: Array.<{ id: number, text_response: string, ...etc }>,
  *       submit: bool,
  *         - true if user is finalizing his update in this submission
  *     }
  *   }
  * @return {Promise}
  * success response: survey_response
  * error response: { errors: [{ attribute: string }] }
  */
  update(responseId, responseFields) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${responseId}`, responseFields);
  }

  /**
  * Unsubmits a survey response
  *
  * @param {number} responseId
  * @return {Promise}
  * success response: survey_response
  * error response: {}
  */
  unsubmit(responseId) {
    return this.getClient().post(`${this._getUrlPrefix()}/${responseId}/unsubmit`);
  }

  _getUrlPrefix(surveyId) {
    const id = surveyId || this.getSurveyId();
    return `/courses/${this.getCourseId()}/surveys/${id}/responses`;
  }
}
