import BaseAssessmentAPI from './Base';

export default class SubmissionsAPI extends BaseAssessmentAPI {
  index() {
    return this.getClient().get(this._getUrlPrefix());
  }

  downloadAll(courseUsers) {
    return this.getClient().get(`${this._getUrlPrefix()}/download_all`, {
      params: { course_users: courseUsers },
    });
  }

  downloadStatistics(courseUsers) {
    return this.getClient().get(`${this._getUrlPrefix()}/download_statistics`, {
      params: { course_users: courseUsers },
    });
  }

  publishAll(courseUsers) {
    return this.getClient().patch(`${this._getUrlPrefix()}/publish_all`, {
      course_users: courseUsers,
    });
  }

  forceSubmitAll(courseUsers) {
    return this.getClient().patch(`${this._getUrlPrefix()}/force_submit_all`, {
      course_users: courseUsers,
    });
  }

  unsubmit(submissionId) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${submissionId}/unsubmit`,
    );
  }

  unsubmitSubmission(submissionId) {
    return this.getClient().patch(`${this._getUrlPrefix()}/unsubmit`, {
      submission_id: submissionId,
    });
  }

  unsubmitAll(courseUsers) {
    return this.getClient().patch(`${this._getUrlPrefix()}/unsubmit_all`, {
      course_users: courseUsers,
    });
  }

  delete(submissionId) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${submissionId}/delete`,
    );
  }

  deleteSubmission(submissionId) {
    return this.getClient().patch(`${this._getUrlPrefix()}/delete`, {
      submission_id: submissionId,
    });
  }

  deleteAll(courseUsers) {
    return this.getClient().patch(`${this._getUrlPrefix()}/delete_all`, {
      course_users: courseUsers,
    });
  }

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

    return this.getClient().patch(
      `${this._getUrlPrefix()}/${submissionId}`,
      formData,
      config,
    );
  }

  reloadAnswer(submissionId, params) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${submissionId}/reload_answer`,
      params,
    );
  }

  submitAnswer(submissionId, answerFields) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    const formData = new FormData();
    SubmissionsAPI.appendFormData(formData, answerFields);

    return this.getClient().patch(
      `${this._getUrlPrefix()}/${submissionId}/submit_answer`,
      formData,
      config,
    );
  }

  autoGrade(submissionId) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${submissionId}/auto_grade`,
    );
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
