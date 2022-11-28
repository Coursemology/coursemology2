import BaseCourseAPI from './Base';

export default class AssessmentsAPI extends BaseCourseAPI {
  /**
   * Fetches all assessments in the default tab, or a specified category and tab.
   * @param {number=} categoryId
   * @param {number=} tabId
   * @returns An `AssessmentsListData` object
   */
  index(categoryId, tabId) {
    return this.getClient().get(this._getUrlPrefix(), {
      params: { category: categoryId, tab: tabId },
    });
  }

  /**
   * Fetches the details for an assessment.
   * @param {number} assessmentId
   * @returns An `AssessmentData` object
   */
  fetch(assessmentId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${assessmentId}`);
  }

  fetchEditData(assessmentId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${assessmentId}/edit`);
  }

  /**
   * Create an assessment.
   *
   * @param {object} params - params in the format of:
   *   {
   *     category: number, tab: number,
   *     assessment: { :title, :description, etc }
   *   }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  create(params) {
    return this.getClient().post(this._getUrlPrefix(), params);
  }

  /**
   * Update the assessment.
   *
   * @param {number} assessmentId
   * @param {object} params - params in the format of { assessment: { :title, :description, etc } }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  update(assessmentId, params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${assessmentId}`,
      params,
    );
  }

  /**
   * Deletes an assessment.
   * @param {string} deleteUrl
   */
  delete(deleteUrl) {
    return this.getClient().delete(deleteUrl);
  }

  /**
   * Fetches assessment skills options
   *
   * @return {Promise}
   * success response: array of skills
   */
  fetchSkills() {
    return this.getClient().get(`${this._getUrlPrefix()}/skills/options`);
  }

  /**
   * Sends emails to remind students to complete the assessment.
   *
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  remind(assessmentId, courseUsers) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${assessmentId}/remind`,
      {
        course_users: courseUsers,
      },
    );
  }

  /**
   * Deletes a question in an assessment.
   * @param {string} questionUrl
   */
  deleteQuestion(questionUrl) {
    return this.getClient().delete(questionUrl);
  }

  /**
   * Reorders the questions in an assessment.
   * @param {number} assessmentId
   * @param {number[]} questionIds Question IDs in the new ordering
   */
  reorderQuestions(assessmentId, questionIds) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${assessmentId}/reorder`,
      questionIds,
    );
  }

  /**
   * Duplicates a question to an assessment.
   * @param {string} duplicationUrl
   */
  duplicateQuestion(duplicationUrl) {
    return this.getClient().post(duplicationUrl);
  }

  /**
   * Converts an MCQ to an MRQ, or vice versa.
   * @param {string} convertUrl
   */
  convertMcqMrq(convertUrl) {
    return this.getClient().patch(convertUrl);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/assessments`;
  }
}
