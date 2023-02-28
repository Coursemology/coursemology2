import { AxiosResponse } from 'axios';
import {
  SkillBranchListData,
  SkillListData,
  SkillPermissions,
} from 'types/course/assessment/skills/skills';

import BaseCourseAPI from './Base';

export default class SkillsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/skills`;
  }

  get #branchUrlPrefix(): string {
    return `/courses/${this.courseId}/assessments/skill_branches`;
  }

  /**
   * Fetches a list of skill branches and skills in a course.
   */
  index(): Promise<
    AxiosResponse<{
      skillBranches: SkillBranchListData[];
      permissions: SkillPermissions;
    }>
  > {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Creates a skill.
   *
   * @param {object} params - params in the format of:
   *   {
   *     skill: { :title, :description, :skillBranchId }
   *   }
   * @return {Promise}
   * success response: { :id } - ID of created skill.
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  create(params: FormData): Promise<AxiosResponse<SkillListData>> {
    return this.client.post(this.#urlPrefix, params);
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
  createBranch(params: FormData): Promise<AxiosResponse<SkillBranchListData>> {
    return this.client.post(this.#branchUrlPrefix, params);
  }

  /**
   * Updates the skill.
   *
   * @param {number} skillId
   * @param {object} params - params in the format of { skill: { :title, :description, :skillBranchId } }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  update(
    skillId: number,
    params: FormData | object,
  ): Promise<AxiosResponse<SkillListData>> {
    return this.client.patch(`${this.#urlPrefix}/${skillId}`, params);
  }

  /**
   * Updates the skill branch.
   *
   * @param {number} branchId
   * @param {object} params - params in the format of { skill_branch: { :title, :description } }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  updateBranch(
    branchId: number,
    params: FormData | object,
  ): Promise<AxiosResponse<SkillBranchListData>> {
    return this.client.patch(`${this.#branchUrlPrefix}/${branchId}`, params);
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
    return this.client.delete(`${this.#urlPrefix}/${skillId}`);
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
    return this.client.delete(`${this.#branchUrlPrefix}/${branchId}`);
  }
}
