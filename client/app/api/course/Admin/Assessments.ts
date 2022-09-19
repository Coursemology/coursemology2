import { AxiosResponse } from 'axios';

import type {
  AssessmentCategory,
  AssessmentCategoryPostData,
  AssessmentSettingsData,
  AssessmentSettingsPostData,
  AssessmentTab,
  AssessmentTabPostData,
} from 'types/course/admin/assessments';
import BaseAdminAPI from './Base';

type Response = Promise<AxiosResponse<AssessmentSettingsData>>;

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
}
