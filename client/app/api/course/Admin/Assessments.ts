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
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/assessments`;
  }

  index(): Response {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(data: AssessmentSettingsPostData): Response {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }

  createCategory(data: AssessmentCategoryPostData): Response {
    return this.getClient().post(`${this._getUrlPrefix()}/categories`, data);
  }

  createTabInCategory(
    id: AssessmentCategory['id'],
    data: AssessmentTabPostData,
  ): Response {
    return this.getClient().post(
      `${this._getUrlPrefix()}/categories/${id}/tabs`,
      data,
    );
  }

  deleteCategory(id: AssessmentCategory['id']): Response {
    return this.getClient().delete(`${this._getUrlPrefix()}/categories/${id}`);
  }

  deleteTabInCategory(
    id: AssessmentCategory['id'],
    tabId: AssessmentTab['id'],
  ): Response {
    return this.getClient().delete(
      `${this._getUrlPrefix()}/categories/${id}/tabs/${tabId}`,
    );
  }

  moveAssessments(data: MoveAssessmentsPostData): MovedAssessmentsResponse {
    return this.getClient().post(
      `${super._getUrlPrefix()}/move_assessments`,
      data,
    );
  }

  moveTabs(data: MoveTabsPostData): MovedTabsResponse {
    return this.getClient().post(`${super._getUrlPrefix()}/move_tabs`, data);
  }
}
