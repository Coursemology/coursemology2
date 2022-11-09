import { AxiosResponse } from 'axios';
import type { LessonPlanSettings } from 'types/course/admin/lessonPlan';

import BaseAdminAPI from './Base';

export default class LessonPlanSettingsAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/lesson_plan`;
  }

  index(): Promise<AxiosResponse<LessonPlanSettings>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Update a lesson plan setting.
   *
   * @param {object} params
   *   - params in the format of
   *     { lesson_plan_settings: { lesson_plan_item_settings: { :component, :key, :enabled, :options } } }
   *
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  update(params): Promise<AxiosResponse<LessonPlanSettings>> {
    return this.getClient().patch(this._getUrlPrefix(), params);
  }
}
