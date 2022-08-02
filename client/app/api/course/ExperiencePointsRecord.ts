import { AxiosResponse } from 'axios';
import {
  ExperiencePointsRecordListData,
  UpdateExperiencePointsRecordPatchData,
} from 'types/course/experiencePointsRecords';
import BaseCourseAPI from './Base';

export default class ExperiencePointsRecordAPI extends BaseCourseAPI {
  _baseUrlPrefix: string = `/courses/${this.getCourseId()}`;

  /**
   * Fetches experience points record data from specified user
   */
  index(
    userId: number,
    pageNum: number = 1,
  ): Promise<
    AxiosResponse<{
      name: string;
      rowCount: number;
      rowData: ExperiencePointsRecordListData[];
    }>
  > {
    return this.getClient().get(
      `${this._baseUrlPrefix}/users/${userId}/experience_points_records?page_num=${pageNum}`,
    );
  }

  /**
   * Update experience points record for user
   */
  update(
    params: UpdateExperiencePointsRecordPatchData,
    recordId: number,
  ): Promise<AxiosResponse<void>> {
    const url = `${
      this._baseUrlPrefix
    }/users/${this.getCourseUserId()}/experience_points_records/${recordId}`;
    return this.getClient().patch(url, params);
  }

  /**
   * Delete experience points record for user
   */
  delete(recordId: number): Promise<AxiosResponse<void>> {
    const url = `${
      this._baseUrlPrefix
    }/users/${this.getCourseUserId()}/experience_points_records/${recordId}`;
    return this.getClient().delete(url);
  }
}
