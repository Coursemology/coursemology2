import { AxiosResponse } from 'axios';
import { SkillListData, SkillResponseData } from 'types/course/assessment/skills/skills';
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
   * Creates a skill.
   *
   * @param {object} params - params in the format of:
   *   {
   *     skill: { :title, :description, :skill_branch_id }
   *   }
   * @return {Promise}
   * success response: { :id } - ID of created skill.
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
   create(params: FormData): Promise<
    AxiosResponse<{
      id: number;
      canUpdate: boolean;
      canDestroy: boolean;
    }>
  > {
    return this.getClient().post(this._getUrlPrefix(), params);
  }

  /**
   * Creates a skill branch.
   *
   * @param {object} params - params in the format of:
   *   {
   *     skill_branch: { :title, :description }
   *   }
   * @return {Promise}
   * success response: { :id } - ID of created skill.
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
   createBranch(params: FormData): Promise<
    AxiosResponse<SkillResponseData>
  > {
    return this.getClient().post(this._getBranchUrlPrefix(), params);
  }

 /**
  * Updates the skill.
  *
  * @param {number} skillId
  * @param {object} params - params in the format of { skill: { :title, :description, :skill_branch_id } }
  * @return {Promise}
  * success response: {}
  * error response: { errors: [] } - An array of errors will be returned upon validation error.
  */
 update(
   skillId: number,
   params: FormData | object,
 ): Promise<AxiosResponse> {
   return this.getClient().patch(
     `${this._getUrlPrefix()}/${skillId}`,
     params,
   );
 }
 /**
  * Updates the skill branch.
  *
  * @param {number} skillId
  * @param {object} params - params in the format of { skill_branch: { :title, :description } }
  * @return {Promise}
  * success response: {}
  * error response: { errors: [] } - An array of errors will be returned upon validation error.
  */
  updateBranch(
    branchId: number,
    params: FormData | object,
  ): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${this._getBranchUrlPrefix()}/${branchId}`,
      params,
    );
  }

  /**
   * Deletes a skill.
   *
   * @param {number} skillId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
   delete(skillId: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this._getUrlPrefix()}/${skillId}`);
  }

  /**
   * Deletes a skillBranch.
   *
   * @param {number} branchId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  deleteBranch(branchId: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this._getBranchUrlPrefix()}/${branchId}`);
  }
}
