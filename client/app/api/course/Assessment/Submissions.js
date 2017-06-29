import BaseAssessmentAPI from './Base';

export default class SubmissionsAPI extends BaseAssessmentAPI {
  /**
  * Fetches a Submission
  *
  * @param {number} submissionId
  * @return {Promise}
  * success response: submission_with_questions_and_answers
  */
  edit(submissionId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${submissionId}/edit`);
  }

  update(submissionId, submissionFields) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    const formData = new FormData();
    SubmissionsAPI.appendFormData(formData, submissionFields);

    return this.getClient().patch(`${this._getUrlPrefix()}/${submissionId}`, formData, config);
  }

  reloadAnswer(submissionId, params) {
    return this.getClient().post(`${this._getUrlPrefix()}/${submissionId}/reload_answer`, params);
  }

  createProgrammingAnnotation(submissionId, answerId, fileId, params) {
    const url = `${this._getUrlPrefix()}/${submissionId}/answers/${answerId}/programming/files/${fileId}/annotations`;
    return this.getClient().post(url, params);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/assessments/${this.getAssessmentId()}/submissions`;
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
        SubmissionsAPI.appendFormData(formData, item, `${prefix}[]`);
      });
    } else if (typeof data === 'object' && !(data instanceof File)) {
      Object.keys(data).forEach((key) => {
        SubmissionsAPI.appendFormData(formData, data[key], `${prefix}[${key}]`);
      });
    } else {
      formData.append(name, data);
    }
  }
}
