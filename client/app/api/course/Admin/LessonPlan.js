import BaseAdminAPI from './Base';

export default class LessonPlanAPI extends BaseAdminAPI {
  /**
   * Update a lesson plan setting.
   *
   * @param {object} params
   *   - params in the format of {
   *                               lesson_plan_settings:
   *                                 {
   *                                   lesson_plan_item_settings:
   *                                     { :component, :key, :enabled, :options }
   *                                 }
   *                             }
   *
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  update(params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/lesson_plan`,
      params,
    );
  }
}
