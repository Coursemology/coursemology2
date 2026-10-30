import {
  ProgrammingAnswerData,
  ProgrammingFileDeleteData,
  ProgrammingFilesPostData,
} from 'types/course/assessment/submission/answer/programming';

import { APIResponse } from 'api/types';

import BaseAssessmentAPI from '../../Base';
import SubmissionsAPI from '../../Submissions';

export default class ProgrammingAPI extends BaseAssessmentAPI {
  /**
   * Creates the new files of a programming answer and updates the content of its saved ones.
   *
   * @returns The answer as saved. A failed validation is a 400 with `errors`, and `codes` naming why.
   */
  createProgrammingFiles(
    answerId: number,
    data: ProgrammingFilesPostData,
  ): APIResponse<ProgrammingAnswerData> {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    const formData = new FormData();
    SubmissionsAPI.appendFormData(formData, data);

    const url = `${this.#urlPrefix}/${answerId}/programming/create_programming_files`;
    return this.client.post(url, formData, config);
  }

  /**
   * Deletes a file from a programming answer.
   *
   * @returns The answer as saved. A failure is a 400 with `errors`.
   */
  deleteProgrammingFile(
    answerId: number,
    data: ProgrammingFileDeleteData,
  ): APIResponse<ProgrammingAnswerData> {
    return this.client.post(
      `${this.#urlPrefix}/${answerId}/programming/destroy_programming_file`,
      data,
    );
  }

  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}\
/submissions/${this.submissionId}/answers`;
  }
}
