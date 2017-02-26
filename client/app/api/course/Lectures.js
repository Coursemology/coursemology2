import BaseCourseAPI from './Base';

export default class LecturesAPI extends BaseCourseAPI {
  /**
  * Get Braincert Virtual Classroom Access Link
  *
  * @param {number} lectureId
  * @return {Promise}
  * success response: { link }
  * error response: { errors: String } - An error string will be returned upon validation error.
  */
  accessLink(lectureId) {
    return this.getClient()
      .get(Routes.access_link_course_lecture_path(
        this.getCourseId(), lectureId, { format: 'json' }));
  }
}