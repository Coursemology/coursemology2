import {
  ExperiencePointsRecordListData,
  ExperiencePointsRecords,
  ExperiencePointsRecordsForUser,
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
   * Fetches all experience points records for all users
   */
  fetchAllExp(filter: {
    pageNum: number;
    studentId?: number;
  }): APIResponse<ExperiencePointsRecords> {
    return this.client.get(`${this.#urlPrefix}/experience_points_records`, {
      params: {
        'filter[page_num]': filter.pageNum,
        'filter[student_id]': filter.studentId,
      },
    });
  }

  downloadCSV(studentId?: number): APIResponse<JobSubmitted> {
    return this.client.get(
      `${this.#urlPrefix}/experience_points_records/download`,
      {
        params: { 'filter[student_id]': studentId },
      },
    );
  }

  /**
   * Fetches all experience points records for a user
   */
  fetchExpForUser(
    userId: number,
    pageNum: number = 1,
  ): APIResponse<ExperiencePointsRecordsForUser> {
    return this.client.get(
      `${this.#urlPrefix}/users/${userId}/experience_points_records`,
      { params: { 'filter[page_num]': pageNum } },
    );
  }

  /**
   * Update an experience points record for a user
   */
  update(
    params: UpdateExperiencePointsRecordPatchData,
    recordId: number,
    studentId: number,
  ): APIResponse<ExperiencePointsRecordListData> {
    const url = `${this.#urlPrefix}/users/${studentId}/experience_points_records/${recordId}`;
    return this.client.patch(url, params);
  }

  /**
   * Delete an experience points record for a user
   */
  delete(recordId: number, studentId: number): APIResponse {
    const url = `${this.#urlPrefix}/users/${studentId}/experience_points_records/${recordId}`;
    return this.client.delete(url);
  }
}
