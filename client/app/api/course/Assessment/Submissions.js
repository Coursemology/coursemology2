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

  fetchSubmissionsFromKoditsu() {
    return this.client.patch(
      `${this.#urlPrefix}/fetch_submissions_from_koditsu`,
    );
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

  generateLiveFeedback(
    submissionId,
    answerId,
    threadId,
    message,
    options,
    optionId,
  ) {
    return this.client.post(
      `${this.#urlPrefix}/${submissionId}/generate_live_feedback`,
      {
        thread_id: threadId,
        answer_id: answerId,
        message,
        options,
        option_id: optionId,
      },
    );
  }

  createLiveFeedbackChat(submissionId, params) {
    return this.client.post(
      `${this.#urlPrefix}/${submissionId}/create_live_feedback_chat`,
      params,
    );
  }

  fetchLiveFeedbackStatus(threadId) {
    return this.client.get(`${this.#urlPrefix}/fetch_live_feedback_status`, {
      params: { thread_id: threadId },
    });
  }

  fetchLiveFeedback(feedbackUrl, feedbackToken) {
    const CODAVERI_API_VERSION = '2.1';

    return this.externalClient.get(`/signed/chat/feedback/messages`, {
      baseURL: feedbackUrl,
      headers: { 'x-api-version': CODAVERI_API_VERSION },
      params: { token: feedbackToken },
    });
  }

  fetchLiveFeedbackChat(answerId) {
    return this.client.get(`${this.#urlPrefix}/fetch_live_feedback_chat`, {
      params: { answer_id: answerId },
    });
  }

  saveLiveFeedback(currentThreadId, content, isError) {
    return this.client.post(`${this.#urlPrefix}/save_live_feedback`, {
      current_thread_id: currentThreadId,
      content,
      is_error: isError,
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
    if (data === undefined || data === null) {
      return;
    }

    if (data instanceof Array) {
      if (!name) throw new Error('form key cannot be empty for array data');
      if (data.length === 0) {
        formData.append(`${name}[]`, null);
      }
      data.forEach((item) => {
        SubmissionsAPI.appendFormData(formData, item, `${name}[]`);
      });
    } else if (typeof data === 'object' && !(data instanceof File)) {
      Object.keys(data).forEach((key) => {
        SubmissionsAPI.appendFormData(
          formData,
          data[key],
          name ? `${name}[${key}]` : key,
        );
      });
    } else {
      formData.append(name, data);
    }
  }
}
