import { AxiosResponse } from 'axios';
import {
  ExperiencePointsRecordListData,
  UpdateExperiencePointsRecordPatchData,
} from 'types/course/experiencePointsRecords';

import BaseCourseAPI from './Base';

export default class ExperiencePointsRecordAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}`;
  }

  /**
   * Fetches all experience points records from a user
   */
  index(
    userId: number,
    pageNum: number = 1,
  ): Promise<
    AxiosResponse<{
      courseUserName: string;
      rowCount: number;
      experiencePointRecords: ExperiencePointsRecordListData[];
    }>
  > {
    return this.client.get(
      `${
        this.#urlPrefix
      }/users/${userId}/experience_points_records?filter[page_num]=${pageNum}`,
    );
  }

  /**
   * Update an experience points record for a user
   */
  update(
    params: UpdateExperiencePointsRecordPatchData,
    recordId: number,
  ): Promise<AxiosResponse<ExperiencePointsRecordListData>> {
    const url = `${this.#urlPrefix}/users/${
      this.courseUserId
    }/experience_points_records/${recordId}`;
    return this.client.patch(url, params);
  }

  /**
   * Delete an experience points record for a user
   */
  delete(recordId: number): Promise<AxiosResponse<void>> {
    const url = `${this.#urlPrefix}/users/${
      this.courseUserId
    }/experience_points_records/${recordId}`;
    return this.client.delete(url);
  }
}
