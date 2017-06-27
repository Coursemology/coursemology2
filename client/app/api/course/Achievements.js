import BaseCourseAPI from './Base';

export default class AchievementsAPI extends BaseCourseAPI {
  /**
   * Create an achievement.
   *
   * @param {object} params - params in the format of:
   *   {
   *     achievement: { :title, :description, etc }
   *   }
   * @return {Promise}
   * success response: { :id } - ID of created achievement.
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  create(params) {
    return this.getClient().post(this._getUrlPrefix(), params);
  }

  /**
   * Update the achievement.
   *
   * @param {number} achievementId
   * @param {object} params - params in the format of { achievement: { :title, :description, etc } }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  update(achievementId, params) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${achievementId}`, params);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/achievements`;
  }
}
