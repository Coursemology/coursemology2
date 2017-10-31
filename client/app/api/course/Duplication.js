import BaseCourseAPI from './Base';

export default class DuplicationAPI extends BaseCourseAPI {
  /**
  * Fetches a list of all objects in course
  *
  * @return {Promise}
  * success response: {
  *   assessmentComponent: Array.<categoryShape>,
  *   currentHost: string,
  *   targetCourses: Array.<courseShape>,
  * }
  *
  * See course/duplication/propTypes.js for categoryShape and courseShape.
  */
  fetch() {
    return this.getClient().get(`${this._getUrlPrefix()}/new`);
  }

  /**
  * Duplicates selected items to the target course.
  *
  * @param {object} params in the form {
  *   items: { TAB: Array.<number>, ASSESSMENT: Array.<number>, ... },
  *   target_course_id: number,
  * }
  * @return {Promise}
  * success response: { redirect_url: string }
  * error response: {}
  */
  duplicateItems(params) {
    return this.getClient().post(this._getUrlPrefix(), params);
  }

  /**
  * Duplicates course.
  *
  * @param {object} params in the form {
  *   duplication: { new_title: string, new_start_at: Date }
  * }
  * @return {Promise}
  * success response: { redirect_url: string }
  * error response: {}
  */
  duplicateCourse(params) {
    return this.getClient().post(`/courses/${this.getCourseId()}/duplication`, params);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/object_duplication`;
  }
}
