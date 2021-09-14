import BaseAssessmentAPI from '../../Base';

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
    ProgrammingAPI.appendFormData(formData, submissionFields);

    const url = `${this._getUrlPrefix()}/${answerId}/programming/create_programming_files`;
    return this.getClient().post(url, formData, config);
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
    return this.getClient().post(
      `${this._getUrlPrefix()}/${answerId}/programming/destroy_programming_file`,
      payload
    );
  }

  _getUrlPrefix() {
    const prefix = `/courses/${this.getCourseId()}/assessments/${this.getAssessmentId()}\
/submissions/${this.getSubmissionId()}/answers`;
    return prefix;
  }

  static appendFormData(formData, data, name) {
    const prefix = name || '';

    if (data === undefined || data === null) {
      return;
    }

    if (data instanceof Array) {
      if (data.length === 0) {
        formData.append(`${prefix}[]`, null);
      }
      data.forEach((item) => {
        ProgrammingAPI.appendFormData(formData, item, `${prefix}[]`);
      });
    } else if (typeof data === 'object' && !(data instanceof File)) {
      Object.keys(data).forEach((key) => {
        ProgrammingAPI.appendFormData(formData, data[key], `${prefix}[${key}]`);
      });
    } else {
      formData.append(name, data);
    }
  }
}
