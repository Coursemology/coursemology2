import {
  ExperiencePointsRecordListData,
  ExperiencePointsRecords,
  UpdateExperiencePointsRecordPatchData,
} from 'types/course/experiencePointsRecords';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class ExperiencePointsRecordAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}`;
  }

  /**
   * Fetches all experience points records from all user
   */
  readAllExp(
    studentId?: number,
    pageNum: number = 1,
  ): APIResponse<ExperiencePointsRecords> {
    return this.client.get(`${this.#urlPrefix}/experience_points_records`, {
      params: { 'filter[page_num]': pageNum, 'filter[student_id]': studentId },
    });
  }

  /**
   * Fetches all experience points records from a user
   */
  showUserExp(
    userId: number,
    pageNum: number = 1,
  ): APIResponse<ExperiencePointsRecords> {
    return this.client.get(
      `${this.#urlPrefix}/users/${userId}/experience_points_records`,
      { params: { 'filter[page_num]': pageNum } },
    );
  }

  downloadCSV(studentId?: number): APIResponse<JobSubmitted> {
    return this.client.get(`${this.#urlPrefix}/download_experience_points`, {
      params: { 'filter[student_id]': studentId },
    });
  }

  /**
   * Update an experience points record for a user
   */
  update(
    params: UpdateExperiencePointsRecordPatchData,
    recordId: number,
    studentId: number,
  ): APIResponse<ExperiencePointsRecordListData> {
    const url = `${
      this.#urlPrefix
    }/users/${studentId}/experience_points_records/${recordId}`;
    return this.client.patch(url, params);
  }

  /**
   * Delete an experience points record for a user
   */
  delete(recordId: number, studentId: number): APIResponse {
    const url = `${
      this.#urlPrefix
    }/users/${studentId}/experience_points_records/${recordId}`;
    return this.client.delete(url);
  }
}
