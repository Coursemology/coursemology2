import BaseCourseAPI from '../Base';

export default class CategoriesAPI extends BaseCourseAPI {
  /**
   * Fetches assessment categories (and the associated tabs)
   *
   * @return {Promise}
   * success response: array of categories
   */
  fetchCategories() {
    return this.getClient().get(`${this._getUrlPrefix()}`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/categories`;
  }
}
