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
    return this.getClient().get(`${this._getUrlPrefix()}`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/levels`;
  }
}
