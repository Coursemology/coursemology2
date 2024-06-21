import BaseAssessmentAPI from './Base';

export default class SubmissionsAPI extends BaseAssessmentAPI {
  index() {
    return this.client.get(this.#urlPrefix);
  }

  downloadAll(courseUsers, downloadFormat) {
    return this.client.get(`${this.#urlPrefix}/download_all`, {
      params: { course_users: courseUsers, download_format: downloadFormat },
    });
  }

  downloadStatistics(courseUsers) {
    return this.client.get(`${this.#urlPrefix}/download_statistics`, {
      params: { course_users: courseUsers },
    });
  }

  publishAll(courseUsers) {
    return this.client.patch(`${this.#urlPrefix}/publish_all`, {
      course_users: courseUsers,
    });
  }

  forceSubmitAll(courseUsers) {
    return this.client.patch(`${this.#urlPrefix}/force_submit_all`, {
      course_users: courseUsers,
    });
  }

  unsubmit(submissionId) {
    return this.client.patch(`${this.#urlPrefix}/${submissionId}/unsubmit`);
  }

  unsubmitSubmission(submissionId) {
    return this.client.patch(`${this.#urlPrefix}/unsubmit`, {
      submission_id: submissionId,
    });
  }

  unsubmitAll(courseUsers) {
    return this.client.patch(`${this.#urlPrefix}/unsubmit_all`, {
      course_users: courseUsers,
    });
  }

  delete(submissionId) {
    return this.client.patch(`${this.#urlPrefix}/${submissionId}/delete`);
  }

  deleteSubmission(submissionId) {
    return this.client.patch(`${this.#urlPrefix}/delete`, {
      submission_id: submissionId,
    });
  }

  deleteAll(courseUsers) {
    return this.client.patch(`${this.#urlPrefix}/delete_all`, {
      course_users: courseUsers,
    });
  }

  edit(submissionId) {
    return this.client.get(`${this.#urlPrefix}/${submissionId}/edit`);
  }

  updateGrade(submissionId, updateGradeField) {
    // updateGradeField contains list of {id, grade} of all modified grades in all answers
    return this.client.patch(
      `${this.#urlPrefix}/${submissionId}`,
      updateGradeField,
    );
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

    return this.client.patch(
      `${this.#urlPrefix}/${submissionId}`,
      formData,
      config,
    );
  }

  reloadAnswer(submissionId, params) {
    return this.client.post(
      `${this.#urlPrefix}/${submissionId}/reload_answer`,
      params,
    );
  }

  autoGrade(submissionId) {
    return this.client.post(`${this.#urlPrefix}/${submissionId}/auto_grade`);
  }

  reevaluateAnswer(submissionId, params) {
    return this.client.post(
      `${this.#urlPrefix}/${submissionId}/reevaluate_answer`,
      params,
    );
  }

  generateFeedback(submissionId, params) {
    return this.client.post(
      `${this.#urlPrefix}/${submissionId}/generate_feedback`,
      params,
    );
  }

  generateLiveFeedback(submissionId, params) {
    return this.client.post(
      `${this.#urlPrefix}/${submissionId}/generate_live_feedback`,
      params,
    );
  }

  fetchLiveFeedback(feedbackUrl, feedbackToken) {
    return this.externalClient.get(`/signed/v2/feedback/llm`, {
      baseURL: feedbackUrl,
      // TODO remove this when we cutover to live CV instance
      headers: { 'ngrok-skip-browser-warning': '1' },
      params: { token: feedbackToken },
    });
  }

  createProgrammingAnnotation(submissionId, answerId, fileId, params) {
    const url = `${this.#urlPrefix}/${submissionId}/answers/${answerId}/programming/files/${fileId}/annotations`;
    return this.client.post(url, params);
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions`;
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
