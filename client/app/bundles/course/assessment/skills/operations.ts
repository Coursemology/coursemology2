import CourseAPI from 'api/course';
import { AxiosResponse } from 'axios';
import {
  SkillBranchEntity,
  SkillBranchFormData,
  SkillEntity,
  SkillFormData,
  SkillResponseData,
} from 'types/course/assessment/skills/skills';
import { Operation } from 'types/store';
import * as actions from './actions';

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { skill :
 *     { title, description, skill_branch_id }
 *   }
 */
const formatSkillAttributes = (data: SkillFormData): FormData => {
  const payload = new FormData();

  ['title', 'description', 'skill_branch_id'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`skill[${field}]`, data[field]);
    }
  });

  return payload;
};

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { skill :
 *     { title, description }
 *   }
 */
const formatSkillBranchAttributes = (data: SkillBranchFormData): FormData => {
  const payload = new FormData();

  ['title', 'description'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`skill_branch[${field}]`, data[field]);
    }
  });

  return payload;
};

const fetchSkills = (): Operation<void> => {
  return async (dispatch) =>
    CourseAPI.assessment.skills
      .index()
      .then((response) => {
        const data = response.data;
        dispatch(actions.saveSkillPermissions(data.permissions));
        dispatch(actions.saveSkillBranchList(data.skillBranches));
      })
      .catch((error) => {
        throw error;
      });
};

export function createSkill(
  data: SkillFormData,
): Operation<AxiosResponse<SkillResponseData>> {
  const attributes = formatSkillAttributes(data);
  return async (dispatch) =>
    CourseAPI.assessment.skills.create(attributes).then((response) => {
      const responseData: SkillResponseData = response.data;
      const skill: SkillEntity = {
        ...responseData,
        branchId: data.skill_branch_id,
        title: data.title,
        description: data.description,
      };
      dispatch(actions.saveSkillData(skill));
      return response;
    });
}

export function createSkillBranch(data: SkillBranchFormData): Operation<
  AxiosResponse<{
    id: number;
  }>
> {
  const attributes = formatSkillBranchAttributes(data);
  return async (dispatch) =>
    CourseAPI.assessment.skills.createBranch(attributes).then((response) => {
      const responseData: SkillResponseData = response.data;
      const skillBranch: SkillBranchEntity = {
        ...responseData,
        title: data.title,
        description: data.description,
      };
      dispatch(actions.saveSkillBranchData(skillBranch));
      return response;
    });
}

export function updateSkill(
  skillId: number,
  data: SkillFormData,
): Operation<AxiosResponse<any, any>> {
  const attributes = formatSkillAttributes(data);
  return async (dispatch) =>
    CourseAPI.assessment.skills.update(skillId, attributes).then((response) => {
      const responseData: SkillResponseData = response.data;
      const skill: SkillEntity = {
        ...responseData,
        branchId: data.skill_branch_id,
        title: data.title,
        description: data.description,
      };
      dispatch(actions.saveSkillData(skill));
      return response;
    });
}

export function updateSkillBranch(
  branchId: number,
  data: SkillBranchFormData,
): Operation<AxiosResponse<any, any>> {
  const attributes = formatSkillBranchAttributes(data);
  return async (dispatch) =>
    CourseAPI.assessment.skills
      .updateBranch(branchId, attributes)
      .then((response) => {
        const responseData: SkillResponseData = response.data;
        const skillBranch: SkillBranchEntity = {
          ...responseData,
          title: data.title,
          description: data.description,
        };
        dispatch(actions.saveSkillBranchData(skillBranch));
        return response;
      });
}

export function deleteSkill(skillId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.assessment.skills.delete(skillId).then(() => {
      dispatch(actions.deleteSkill(skillId));
    });
}

export function deleteSkillBranch(branchId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.assessment.skills.deleteBranch(branchId).then(() => {
      dispatch(actions.deleteSkillBranch(branchId));
    });
}

export default fetchSkills;
