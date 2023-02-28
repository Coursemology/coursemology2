import { AxiosResponse } from 'axios';
import {
  ExperiencePointsRecordListData,
  UpdateExperiencePointsRecordPatchData,
} from 'types/course/experiencePointsRecords';

import BaseCourseAPI from './Base';

export default class ExperiencePointsRecordAPI extends BaseCourseAPI {
  #baseUrlPrefix: string = `/courses/${this.getCourseId()}`;

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
    return this.getClient().get(
      `${
        this.#baseUrlPrefix
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
    const url = `${
      this.#baseUrlPrefix
    }/users/${this.getCourseUserId()}/experience_points_records/${recordId}`;
    return this.getClient().patch(url, params);
  }

  /**
   * Delete an experience points record for a user
   */
  delete(recordId: number): Promise<AxiosResponse<void>> {
    const url = `${
      this.#baseUrlPrefix
    }/users/${this.getCourseUserId()}/experience_points_records/${recordId}`;
    return this.getClient().delete(url);
  }
}
