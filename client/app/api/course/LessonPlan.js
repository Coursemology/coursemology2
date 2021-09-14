import BaseCourseAPI from './Base';
/**
 * milestone_fields = {
 *   id: number, title: string, description: string, start_at: string
 * }
 * event_fields = {
 *   id: number, eventId: number, title: string, description: string, location: string,
 *   start_at: string, end_at: string, published: boolean,
 *   lesson_plan_item_type: Array.<string>,
 * }
 */

export default class LessonPlanAPI extends BaseCourseAPI {
  /**
   * Fetches the lesson plan data for the current course.
   *
   * @return {Promise}
   * success response: {
   *   items: Array.<{
   *     id: number, eventId: number, title: string, published: bool, location: string,
   *     start_at: string, bonus_end_at: string, end_at: string,
   *     lesson_plan_item_type: Array.<string>,
   *     materials: Array.<{ id: number, name: string, url: string }>
   *   }>
   *   milestones: milestone_fields,
   *   flags: { canManageLessonPlan: boolean }
   * }
   */
  fetch() {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Creates a lesson plan milestone
   *
   * @param {object} payload
   *   - params in the format of { lesson_plan_milestone: { :title, :description, :start_at } }
   * @return {Promise}
   *
   * success response: milestone_fields
   * error response: { errors: [{ attribute: string }] }
   */
  createMilestone(payload) {
    return this.getClient().post(`${this._getUrlPrefix()}/milestones`, payload);
  }

  /**
   * Updates a lesson plan milestone
   *
   * @param {number} id
   * @param {object} payload
   *   - params in the format of { lesson_plan_milestone: { :start_at etc } }
   * @return {Promise}
   * success response: milestone_fields
   * error response: { errors: [{ attribute: string }] }
   */
  updateMilestone(id, payload) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/milestones/${id}`,
      payload,
    );
  }

  /**
   * Deletes a lesson plan milestone
   *
   * @param {number} id
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  deleteMilestone(id) {
    return this.getClient().delete(`${this._getUrlPrefix()}/milestones/${id}`);
  }

  /**
   * Creates a lesson plan event
   *
   * @param {object} payload
   *   - params in the format of { lesson_plan_event: { :title, :description, :start_at } }
   * @return {Promise}
   *
   * success response: event_fields
   * error response: { errors: [{ attribute: string }] }
   */
  createEvent(payload) {
    return this.getClient().post(`${this._getUrlPrefix()}/events`, payload);
  }

  /**
   * Updates a lesson plan event
   *
   * @param {number} id
   * @param {object} payload
   *   - params in the format of { lesson_plan_event: { :title, :location etc } }
   * @return {Promise}
   * success response: event_fields
   * error response: { errors: [{ attribute: string }] }
   */
  updateEvent(id, payload) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/events/${id}`,
      payload,
    );
  }

  /**
   * Deletes a lesson plan event
   *
   * @param {number} id
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  deleteEvent(id) {
    return this.getClient().delete(`${this._getUrlPrefix()}/events/${id}`);
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
    return this.getClient().patch(
      `${this._getUrlPrefix()}/items/${id}`,
      payload,
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/lesson_plan`;
  }
}
