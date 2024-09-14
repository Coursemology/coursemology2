import BaseCourseAPI from './Base';

export default class AssessmentsAPI extends BaseCourseAPI {
  /**
   * Fetches all assessments in the default tab, or a specified category and tab.
   * @param {number=} categoryId
   * @param {number=} tabId
   * @returns An `AssessmentsListData` object
   */
  index(categoryId, tabId) {
    return this.client.get(this.#urlPrefix, {
      params: { category: categoryId, tab: tabId },
    });
  }

  /**
   * Fetches the details for an assessment.
   * @param {number} assessmentId
   * @returns An `AssessmentData` object
   */
  fetch(assessmentId) {
    return this.client.get(`${this.#urlPrefix}/${assessmentId}`);
  }

  /**
   * Fetches the remaining unlock requirements for an assessment.
   * @param {number} assessmentId
   * @returns An `AssessmentUnlockRequirements` object
   */
  fetchUnlockRequirements(assessmentId) {
    return this.client.get(`${this.#urlPrefix}/${assessmentId}/requirements`);
  }

  fetchEditData(assessmentId) {
    return this.client.get(`${this.#urlPrefix}/${assessmentId}/edit`);
  }

  liveFeedbackSettings(assessmentId) {
    return this.client.get(
      `${this.#urlPrefix}/${assessmentId}/live_feedback_settings`,
    );
  }

  updateLiveFeedbackSettings(assessmentId, params) {
    return this.client.patch(
      `${this.#urlPrefix}/${assessmentId}/live_feedback_settings`,
      params,
    );
  }

  fetchMonitoringData() {
    return this.client.get(
      `${this.#urlPrefix}/${this.assessmentId}/monitoring`,
    );
  }

  /**
   *
   * @returns {import('api/types').APIResponse<import('types/course/assessment/monitoring').SebPayload | null>}
   */
  fetchSebPayload() {
    return this.client.get(
      `${this.#urlPrefix}/${this.assessmentId}/seb_payload`,
    );
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
    return this.client.post(this.#urlPrefix, params);
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
    return this.client.patch(`${this.#urlPrefix}/${assessmentId}`, params);
  }

  /**
   * Deletes an assessment.
   * @param {string} deleteUrl
   */
  delete(deleteUrl) {
    return this.client.delete(deleteUrl);
  }

  /**
   * Creates an assessment attempt.
   *
   * @param {number} assessmentId
   * @returns {import('api/types').APIResponse<import('api/types').JustRedirect>}
   */
  attempt(assessmentId) {
    return this.client.get(`${this.#urlPrefix}/${assessmentId}/attempt`);
  }

  /**
   * Fetches assessment skills options
   *
   * @return {Promise}
   * success response: array of skills
   */
  fetchSkills() {
    return this.client.get(`${this.#urlPrefix}/skills/options`);
  }

  syncWithKoditsu(assessmentId) {
    return this.client.put(
      `${this.#urlPrefix}/${assessmentId}/sync_with_koditsu`,
    );
  }

  inviteToKoditsu(assessmentId) {
    return this.client.post(
      `${this.#urlPrefix}/${assessmentId}/invite_to_koditsu`,
    );
  }

  /**
   * Sends emails to remind students to complete the assessment.
   *
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  remind(assessmentId, courseUsers) {
    return this.client.post(`${this.#urlPrefix}/${assessmentId}/remind`, {
      course_users: courseUsers,
    });
  }

  /**
   * Deletes a question in an assessment.
   * @param {string} questionUrl
   */
  deleteQuestion(questionUrl) {
    return this.client.delete(questionUrl);
  }

  /**
   * Reorders the questions in an assessment.
   * @param {number} assessmentId
   * @param {number[]} questionIds Question IDs in the new ordering
   */
  reorderQuestions(assessmentId, questionIds) {
    return this.client.post(`${this.#urlPrefix}/${assessmentId}/reorder`, {
      question_order: questionIds,
    });
  }

  /**
   * Duplicates a question to an assessment.
   * @param {string} duplicationUrl
   */
  duplicateQuestion(duplicationUrl) {
    return this.client.post(duplicationUrl);
  }

  /**
   * Converts an MCQ to an MRQ, or vice versa.
   * @param {string} convertUrl
   */
  convertMcqMrq(convertUrl) {
    return this.client.patch(convertUrl);
  }

  /**
   * Authenticate a user to access an assessment
   * @param {string|number} assessmentId
   * @param {object} params params in the format { password: string }
   * @return {Promise}
   * success response: {redirectUrl}
   */
  authenticate(assessmentId, params) {
    return this.client.post(
      `${this.#urlPrefix}/${assessmentId}/authenticate`,
      params,
    );
  }

  /**
   * Overrides access for an assessment if blocked by the monitoring component.
   *
   * @param {number} assessmentId
   * @param {string} password
   * @returns {import('api/types').APIResponse<import('api/types').JustRedirect>}
   */
  unblockMonitor(assessmentId, password) {
    return this.client.post(
      `${this.#urlPrefix}/${assessmentId}/unblock_monitor`,
      { assessment: { password } },
    );
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/assessments`;
  }
}
