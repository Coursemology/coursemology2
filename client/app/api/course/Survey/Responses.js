import BaseSurveyAPI from './Base';

export default class ResponsesAPI extends BaseSurveyAPI {
  /**
  * answer_with_response = {
  *   survey: {
  *     id:number, title:string, description:string, start_at:datetime, ...etc,
  *       - Survey attributes
  *     questions: Array.<{description:string, options:Array, question_type:string... etc}>,
  *        - Array of questions belonging to the survey
  *        - question_type is one of ['text', 'multiple_choice', 'multiple_response']
  *   },
  *   response: {
  *     id:number, submitted_at:datetime,
  *       - Response Attributes
  *     answers: Array.<question_id:number, text_response:string, options:Array. etc...>,
  *       - Answer attributes
  *   }
  * }
  */

  /**
  * Fetches a survey response
  *
  * @param {number} responseId
  * @return {Promise}
  * success response: answer_with_response
  * error response: {}
  */
  fetch(responseId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${responseId}/edit`);
  }

  /**
  * Creates a blank survey response
  *
  * @param {number} surveyId
  * @return {Promise}
  * success response: answer_with_response
  * error response:
  *   { responseId:number } if user has an existing survey response
  *   { error:string } if there is some other error
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
  *       answers_attributes:Array.<{id:number, text_response:string, etc}>,
  *       submit:bool, - true if user is finalizing his update in this submission
  *     }
  *   }
  * @return {Promise}
  * success response: answer_with_response
  * error response: { errors: [{ attribute:string }] }
  */
  update(responseId, responseFields) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${responseId}`, responseFields);
  }

  _getUrlPrefix(surveyId) {
    const id = surveyId || this.getSurveyId();
    return `/courses/${this.getCourseId()}/surveys/${id}/responses`;
  }
}
