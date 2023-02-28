import BaseCourseAPI from '../Base';

export default class CategoriesAPI extends BaseCourseAPI {
  /**
   * Fetches assessment categories (and the associated tabs)
   *
   * @return {Promise}
   * success response: array of categories
   */
  fetchCategories() {
    return this.client.get(`${this.#urlPrefix}`);
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/categories`;
  }
}
