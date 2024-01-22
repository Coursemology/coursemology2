import {
  TextResponseAnswerData,
  TextResponseAttachmentDeleteData,
  TextResponseAttachmentPostData,
} from 'types/course/assessment/submission/answer/textResponse';

import { APIResponse } from 'api/types';

import BaseAssessmentAPI from '../../Base';
import SubmissionsAPI from '../../Submissions';

export default class TextResponseAPI extends BaseAssessmentAPI {
  createFiles(
    answerId: number,
    data: TextResponseAttachmentPostData,
  ): APIResponse<TextResponseAnswerData> {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    const formData = new FormData();
    SubmissionsAPI.appendFormData(formData, data);

    const url = `${this.#urlPrefix}/${answerId}/text_response/create_files`;
    return this.client.post(url, formData, config);
  }

  deleteFile(
    answerId: number,
    data: TextResponseAttachmentDeleteData,
  ): APIResponse {
    return this.client.patch(
      `${this.#urlPrefix}/${answerId}/text_response/delete_file`,
      data,
    );
  }

  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}\
/submissions/${this.submissionId}/answers`;
  }
}
