import BaseSurveyAPI from './Base';

export default class SectionsAPI extends BaseSurveyAPI {
  /**
  * survey_section = {
  *   id: number, title: string, weight: number, ...etc,
  *     - Section attributes
  *   questions: Array.<{ description: string, options: Array, question_type: string, ...etc }>,
  *      - Array of questions belonging to the survey
  *      - question_type is one of ['text', 'multiple_choice', 'multiple_response']
  *   canCreateQuestion: bool,
  *      - true if user can create a question for this section
  *   canUpdate: bool, canDelete: bool,
  *      - true if user can update and delete this section respectively
  * }
  */

  /**
  * Creates a survey section
  *
  * @param {object} sectionFields
  *   - params in the format of { section: { :title, :description, etc } }
  * @return {Promise}
  * success response: survey_section
  * error response: { errors: [{ attribute: string }] }
  */
  create(sectionFields) {
    return this.getClient().post(this._getUrlPrefix(), sectionFields);
  }

  /**
  * Updates a survey section
  *
  * @param {number} sectionId
  * @param {object} sectionFields
  *   - params in the format of { section: { :title, :description, etc } }
  * @return {Promise}
  * success response: survey_section
  * error response: { errors: [{ attribute: string }] }
  */
  update(sectionId, sectionFields) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${sectionId}`, sectionFields);
  }

  /**
  * Deletes a survey section
  *
  * @param {number} sectionId
  * @return {Promise}
  * success response: {}
  * error response: {}
  */
  delete(sectionId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${sectionId}`);
  }


  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/surveys/${this.getSurveyId()}/sections`;
  }
}
