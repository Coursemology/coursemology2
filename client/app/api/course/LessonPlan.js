import BaseCourseAPI from './Base';

export default class LessonPlanAPI extends BaseCourseAPI {
  /**
  * Fetches the lesson plan data for the current course.
  *
  * @return {Promise}
  * success response: {
  *   items: Array.<{
  *     id: number, title: string, published: bool, location: string,
  *     start_at: string, bonus_end_at: string, end_at: string,
  *     edit_path: string, delete_path: string,
  *     lesson_plan_item_type: Array.<string>,
  *     materials: Array.<{ id: number, name: string, url: string }>
  *   }>
  *   milestones: Array.<{
  *     id: number, title: string, description: string, start_at: string,
  *     edit_path: string, delete_path: string,
  *   }>
  * }
  */
  fetch() {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
  * Updates a lesson plan milestone
  *
  * @param {number} id
  * @param {object} payload
  *   - params in the format of { lesson_plan_milestone: { :start_at etc } }
  * @return {Promise}
  * success response: {}
  * error response: {}
  */
  updateMilestone(id, payload) {
    return this.getClient().patch(`${this._getUrlPrefix()}/milestones/${id}`, payload);
  }

  /**
  * Updates a lesson plan item
  *
  * @param {number} id
  * @param {object} payload
  *   - params in the format of { item: { :start_at, :published etc } }
  * @return {Promise}
  * success response: {}
  * error response: {}
  */
  updateItem(id, payload) {
    return this.getClient().patch(`${this._getUrlPrefix()}/items/${id}`, payload);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/lesson_plan`;
  }
}
