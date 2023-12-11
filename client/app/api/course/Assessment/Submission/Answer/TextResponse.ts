import { AxiosResponse } from 'axios';
import {
  TextResponseAttachmentPostData,
  TextResponseAttachmentsData,
} from 'types/course/assessment/submission/textResponseAttachment';

import BaseAssessmentAPI from '../../Base';

export default class TextResponseAPI extends BaseAssessmentAPI {
  /**
   * Creates a file and updates all existing files for a text response answer
   *
   * @param {number} answerId
   * @param {object} submissionFields - in the format of:
   *   {
   *     answer: {
   *       id: number,
   *       files: [File]
   *     }
   *   }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  uploadFiles(
    answerId: number,
    submissionFields: TextResponseAttachmentPostData,
  ): Promise<AxiosResponse<TextResponseAttachmentsData>> {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    const formData = new FormData();
    TextResponseAPI.appendFormData(formData, submissionFields);

    const url = `${this.#urlPrefix}/${answerId}/text_response/upload_files`;
    return this.client.post(url, formData, config);
  }

  deleteFile(
    answerId: number,
    currentTime: number,
    attachmentId: number,
  ): Promise<AxiosResponse<TextResponseAttachmentsData>> {
    return this.client.post(
      `${this.#urlPrefix}/${answerId}/text_response/delete_file`,
      { attachment_id: attachmentId, client_version: currentTime },
    );
  }

  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}\
/submissions/${this.submissionId}/answers`;
  }

  static appendFormData(
    formData: FormData,
    data?: TextResponseAttachmentPostData,
    name?: string,
  ): void {
    const prefix = name || '';

    if (data === undefined || data === null) {
      return;
    }

    if (data instanceof Array) {
      if (data.length === 0) {
        formData.append(`${prefix}[]`, '');
      }
      data.forEach((item) => {
        TextResponseAPI.appendFormData(formData, item, `${prefix}[]`);
      });
    } else if (typeof data === 'object' && !(data instanceof File)) {
      Object.keys(data).forEach((key) => {
        TextResponseAPI.appendFormData(
          formData,
          data[key],
          `${prefix}[${key}]`,
        );
      });
    } else {
      formData.append(name || '', data);
    }
  }
}
