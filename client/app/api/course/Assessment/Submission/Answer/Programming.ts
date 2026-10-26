import BaseAssessmentAPI from '../../Base';
import SubmissionsAPI from '../../Submissions';

export default class ProgrammingAPI extends BaseAssessmentAPI {
  /**
   * Creates a programming file and updates all existing files for a programming answer
   *
   * @param {number} answerId
   * @param {object} submissionFields - in the format of:
   *   {
   *     answer: {
   *       id: number,
   *       files_attributes: [:id, :filename, :content]
   *     }
   *   }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  createProgrammingFiles(answerId, submissionFields) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    const formData = new FormData();
    SubmissionsAPI.appendFormData(formData, submissionFields);

    const url = `${this.#urlPrefix}/${answerId}/programming/create_programming_files`;
    return this.client.post(url, formData, config);
  }

  /**
   * Deletes a programming file from a programming answer
   *
   * @param {number} answerId
   * @param {object} payload - in the format of:
   *   {
   *     answer: { id: number, file_id: number }
   *   }
   * @return {Promise}
   * success response: { answerId: number, fileId: number }
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  deleteProgrammingFile(answerId, payload) {
    return this.client.post(
      `${this.#urlPrefix}/${answerId}/programming/destroy_programming_file`,
      payload,
    );
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}\
/submissions/${this.submissionId}/answers`;
  }
}
