import { AxiosResponse } from 'axios';
import { Operation } from 'store';
import {
  SkillBranchListData,
  SkillFormData,
  SkillListData,
} from 'types/course/assessment/skills/skills';

import CourseAPI from 'api/course';

import { actions } from './store';

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { skill :
 *     { title, description, skillBranchId }
 *   }
 */
const formatSkillAttributes = (data: SkillFormData): FormData => {
  const payload = new FormData();

  ['title', 'description', 'skillBranchId'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      // Change to snake casing for backend
      const payloadField =
        field === 'skillBranchId' ? 'skill_branch_id' : field;
      payload.append(`skill[${payloadField}]`, data[field]);
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
const formatSkillBranchAttributes = (data: SkillFormData): FormData => {
  const payload = new FormData();

  ['title', 'description'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`skill_branch[${field}]`, data[field]);
    }
  });

  return payload;
};

export function fetchSkillBranches(): Operation {
  return async (dispatch) =>
    CourseAPI.assessment.skills.index().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveSkillBranchList(data.skillBranches, data.permissions),
      );
    });
}

export function createSkill(
  data: SkillFormData,
): Operation<AxiosResponse<SkillListData>> {
  const attributes = formatSkillAttributes(data);
  return async (dispatch) =>
    CourseAPI.assessment.skills.create(attributes).then((response) => {
      dispatch(actions.saveSkill(response.data));
      return response;
    });
}

export function createSkillBranch(
  data: SkillFormData,
): Operation<AxiosResponse<SkillBranchListData>> {
  const attributes = formatSkillBranchAttributes(data);
  return async (dispatch) =>
    CourseAPI.assessment.skills.createBranch(attributes).then((response) => {
      dispatch(actions.saveSkillBranch(response.data));
      return response;
    });
}

export function updateSkill(
  skillId: number,
  data: SkillFormData,
): Operation<AxiosResponse<SkillListData, unknown>> {
  const attributes = formatSkillAttributes(data);
  return async (dispatch) =>
    CourseAPI.assessment.skills.update(skillId, attributes).then((response) => {
      dispatch(actions.saveSkill(response.data));
      return response;
    });
}

export function updateSkillBranch(
  branchId: number,
  data: SkillFormData,
): Operation<AxiosResponse<SkillBranchListData, unknown>> {
  const attributes = formatSkillBranchAttributes(data);
  return async (dispatch) =>
    CourseAPI.assessment.skills
      .updateBranch(branchId, attributes)
      .then((response) => {
        dispatch(actions.saveSkillBranch(response.data));
        return response;
      });
}

export function deleteSkill(skillId: number): Operation {
  return async (dispatch) =>
    CourseAPI.assessment.skills.delete(skillId).then(() => {
      dispatch(actions.deleteSkill(skillId));
    });
}

export function deleteSkillBranch(branchId: number): Operation {
  return async (dispatch) =>
    CourseAPI.assessment.skills.deleteBranch(branchId).then(() => {
      dispatch(actions.deleteSkillBranch(branchId));
    });
}
