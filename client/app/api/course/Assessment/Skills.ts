import { AxiosResponse } from 'axios';
import { SkillListData } from 'types/course/assessment/skills/skills';
import BaseCourseAPI from './Base';

export default class SkillssAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/assessments/skills`;
  }

  _getBranchUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/assessments/skill_branches`;
  }

  /**
   * Fetches a list of skills in a course.
   */
  index(): Promise<AxiosResponse<SkillListData>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Deletes an skillBranch.
   *
   * @param {number} branchtId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  deleteBranch(branchId: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this._getBranchUrlPrefix()}/${branchId}`);
  }
}
