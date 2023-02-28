import { AxiosResponse } from 'axios';
import type {
  AssessmentCategory,
  AssessmentCategoryPostData,
  AssessmentSettingsData,
  AssessmentSettingsPostData,
  AssessmentTab,
  AssessmentTabPostData,
  MoveAssessmentsPostData,
  MovedAssessmentsResult,
  MovedTabsResult,
  MoveTabsPostData,
} from 'types/course/admin/assessments';

import BaseAdminAPI from './Base';

type Response = Promise<AxiosResponse<AssessmentSettingsData>>;
type MovedAssessmentsResponse = Promise<AxiosResponse<MovedAssessmentsResult>>;
type MovedTabsResponse = Promise<AxiosResponse<MovedTabsResult>>;

export default class AssessmentsAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/assessments`;
  }

  index(): Response {
    return this.getClient().get(this.urlPrefix);
  }

  update(data: AssessmentSettingsPostData): Response {
    return this.getClient().patch(this.urlPrefix, data);
  }

  createCategory(data: AssessmentCategoryPostData): Response {
    return this.getClient().post(`${this.urlPrefix}/categories`, data);
  }

  createTabInCategory(
    id: AssessmentCategory['id'],
    data: AssessmentTabPostData,
  ): Response {
    return this.getClient().post(
      `${this.urlPrefix}/categories/${id}/tabs`,
      data,
    );
  }

  deleteCategory(id: AssessmentCategory['id']): Response {
    return this.getClient().delete(`${this.urlPrefix}/categories/${id}`);
  }

  deleteTabInCategory(
    id: AssessmentCategory['id'],
    tabId: AssessmentTab['id'],
  ): Response {
    return this.getClient().delete(
      `${this.urlPrefix}/categories/${id}/tabs/${tabId}`,
    );
  }

  moveAssessments(data: MoveAssessmentsPostData): MovedAssessmentsResponse {
    return this.getClient().post(`${super.urlPrefix}/move_assessments`, data);
  }

  moveTabs(data: MoveTabsPostData): MovedTabsResponse {
    return this.getClient().post(`${super.urlPrefix}/move_tabs`, data);
  }
}
