import BaseCourseAPI from './Base';

export default class DuplicationAPI extends BaseCourseAPI {
  /**
   * Fetches source and destination course listings and a list of all objects in current course
   *
   * @return {Promise}
   * success response: {
   *   currentHost: string,
   *   destinationCourses: Array.<courseShape>,
   *   sourceCourses: courseListingShape,
   *   sourceCourse: sourceCourseShape,
   *   assessmentComponent: Array.<categoryShape>,
   *   surveyComponent: Array.<surveyShape>,
   *   achievementsComponent: Array.<achievementShape>,
   *   materialsComponent: Array.<folderShape>,
   *   videosComponent: Array.<videoTabShape>,
   * }
   *
   * See course/duplication/propTypes.js for custom propTypes.
   */
  fetch() {
    return this.client.get(`${this.#urlPrefix}/new`);
  }

  /**
   * Fetches a list of all duplicable objects for the given course.
   *
   * @param {string} courseId
   * @return {Promise}
   * success response: {
   *   sourceCourse: sourceCourseShape,
   *   assessmentComponent: Array.<categoryShape>,
   *   surveyComponent: Array.<surveyShape>,
   *   achievementsComponent: Array.<achievementShape>,
   *   materialsComponent: Array.<folderShape>,
   *   videosComponent: Array.<videoTabShape>,
   * }
   *
   * See course/duplication/propTypes.js for custom propTypes.
   */
  data(courseId) {
    return this.client.get(`/courses/${courseId}/object_duplication/data`);
  }

  /**
   * Duplicates selected items to the target course.
   *
   * @param {number} sourceCourseId
   * @param {object} params in the form {
   *   items: { TAB: Array.<number>, ASSESSMENT: Array.<number>, ... },
   *   destination_course_id: number,
   * }
   * @return {Promise}
   * success response: { status: 'submitted', jobUrl: string }
   * error response: {}
   */
  duplicateItems(sourceCourseId, params) {
    const url = `/courses/${sourceCourseId}/object_duplication`;
    return this.client.post(url, params);
  }

  /**
   * Duplicates course.
   *
   * @param {number} sourceCourseId
   * @param {object} params in the form {
   *   duplication: { new_title: string, new_start_at: Date }
   * }
   * @return {Promise}
   * success response: { status: 'submitted', jobUrl: string }
   * error response: {}
   */
  duplicateCourse(sourceCourseId, params) {
    return this.client.post(`/courses/${sourceCourseId}/duplication`, params);
  }

  get #urlPrefix() {
    return `/courses/${this.getCourseId()}/object_duplication`;
  }
}
