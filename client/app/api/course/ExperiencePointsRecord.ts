import { AxiosResponse } from 'axios';
import {
  ExperiencePointsRecordListData,
  ExperiencePointsRecords,
  UpdateExperiencePointsRecordPatchData,
} from 'types/course/experiencePointsRecords';
import { JobSubmitted } from 'types/jobs';

import BaseCourseAPI from './Base';

export default class ExperiencePointsRecordAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}`;
  }

  /**
   * Fetches all experience points records from all user
   */
  indexAll(
    studentId?: number,
    pageNum: number = 1,
  ): Promise<AxiosResponse<ExperiencePointsRecords>> {
    return this.client.get(`${this.#urlPrefix}/experience_points_records`, {
      params: { 'filter[page_num]': pageNum, 'filter[student_id]': studentId },
    });
  }

  /**
   * Fetches all experience points records from a user
   */
  index(
    userId: number,
    pageNum: number = 1,
  ): Promise<AxiosResponse<ExperiencePointsRecords>> {
    return this.client.get(
      `${this.#urlPrefix}/users/${userId}/experience_points_records`,
      { params: { 'filter[page_num]': pageNum } },
    );
  }

  download(studentId?: number): Promise<AxiosResponse<JobSubmitted>> {
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
    studentId?: number,
  ): Promise<AxiosResponse<ExperiencePointsRecordListData>> {
    const url = `${this.#urlPrefix}/users/${
      this.courseUserId ?? studentId
    }/experience_points_records/${recordId}`;
    return this.client.patch(url, params);
  }

  /**
   * Delete an experience points record for a user
   */
  delete(recordId: number, studentId?: number): Promise<AxiosResponse<void>> {
    const url = `${this.#urlPrefix}/users/${
      this.courseUserId ?? studentId
    }/experience_points_records/${recordId}`;
    return this.client.delete(url);
  }
}
