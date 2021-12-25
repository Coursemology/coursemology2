import {
  getAssessmentId,
  getCourseId,
  getScribingId,
} from 'lib/helpers/url-helpers';

import BaseAPI from '../Base';
import SubmissionsAPI from '../Submissions';

export default class ScribingQuestionAPI extends BaseAPI {
  /**
   * question = {
   *   id: number,
   *   title: string,
   *   description: string,
   *   staff_only_comments: string,
   *   maximum_grade: string,
   *   weight: number,
   *   skill_ids [],
   *   skills: [],
   *   published_assessment: boolean,
   *   attempt_limit: number,
   * }
   */

  /**
   * Fetches a Scribing question
   *
   * @param {number} scribingId
   * @return {Promise}
   * success response: scribing_question
   */
  fetch() {
    return this.getClient().get(
      `${ScribingQuestionAPI._getUrlPrefix()}/${getScribingId()}`,
    );
  }

  /**
   * Helper method to generate FormData. Use SubmissionsAPI.appendFormData as it supports
   * nested objects.
   *
   * @param {object} question object to be converted
   * @return {FormData}
   */
  static generateFormData(question) {
    const formData = new FormData();
    SubmissionsAPI.appendFormData(formData, question, 'question_scribing');
    return formData;
  }

  /**
   * Creates a Scribing question
   *
   * @param {object} scribingFields - params in the format of
   *                                { question_scribing: { :title, :description, etc } }
   * @return {Promise}
   * success response: scribing_question
   * error response: { errors: [{ attribute: string }] }
   */
  create(scribingFields) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };
    const formData = ScribingQuestionAPI.generateFormData(
      scribingFields.question_scribing,
    );

    return this.getClient().post(
      ScribingQuestionAPI._getUrlPrefix(),
      formData,
      config,
    );
  }

  /**
   * Updates a Scribing question
   *
   * @param {number} scribingId
   * @param {object} scribingFields - params in the format of
   *                                { survey: { :title, :description, etc } }
   * @return {Promise}
   * success response: scribing_question
   * error response: { errors: [{ attribute: string }] }
   */
  update(scribingId, scribingFields) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };
    const formData = ScribingQuestionAPI.generateFormData(
      scribingFields.question_scribing,
    );

    return this.getClient().patch(
      `${ScribingQuestionAPI._getUrlPrefix()}/${scribingId}`,
      formData,
      config,
    );
  }

  /**
   * Deletes a Scribing question
   *
   * @param {number} scribingId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  delete(scribingId) {
    return this.getClient().delete(
      `${ScribingQuestionAPI._getUrlPrefix()}/${scribingId}`,
    );
  }

  static _getUrlPrefix() {
    return `/courses/${getCourseId()}/assessments/${getAssessmentId()}/question/scribing`;
  }
}
