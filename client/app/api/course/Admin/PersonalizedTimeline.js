import BaseAdminAPI from './Base';

export default class PersonalizedTimelineAPI extends BaseAdminAPI {
  /**
   * Fetches learning rates for the duration of the module.
   */
  fetchLearningRates() {
    return this.getClient().get(
      `${this._getUrlPrefix()}/personalized_timeline/learning_rates`,
    );
  }

  /**
   * Updates personalized timeline settings.
   */
  update(params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/personalized_timeline`,
      params,
    );
  }
}
