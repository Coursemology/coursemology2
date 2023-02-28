import BaseCourseAPI from './Base';

export default class LevelAPI extends BaseCourseAPI {
  /**
   * Fetches a list of all levels in course
   *
   * @return {Promise}
   * success response: {
   *   levels: Array,
   * }
   */
  fetch() {
    return this.client.get(`${this.#urlPrefix}`);
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/levels`;
  }

  save(levelFields) {
    return this.client.post(this.#urlPrefix, { levels: levelFields });
  }
}
