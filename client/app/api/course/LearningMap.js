import BaseCourseAPI from './Base';

export default class LearningMapAPI extends BaseCourseAPI {
  /**
   * Fetches all nodes in the learning map for the current user and course.
   *
   * @return {Promise}
   * success response: {
   *   nodes: Array.<{
   *     id: string, unlocked: boolean, satisfiability_type: string,
   *     course_material_type: string, content_url: string,
   *     children: Array.<{ id: string, is_satisfied: boolean }>,
   *     parents: Array.<{ id: string, is_satisfied: boolean }>,
   *     unlock_rate: number, unlock_level: number,
   *     ... (Other fields specific to the individual course material type)
   *   }>,
   *   can_modify: boolean
   * }
   * error response: { errors: Array.<string> }
   */
  index() {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Adds a parent node to the specified node.
   *
   * @return {Promise}
   * success response: {
   *   nodes: Array.<{
   *     id: string, unlocked: boolean, satisfiability_type: string,
   *     course_material_type: string, content_url: string,
   *     children: Array.<{ id: string, is_satisfied: boolean }>,
   *     parents: Array.<{ id: string, is_satisfied: boolean }>,
   *     unlock_rate: number, unlock_level: number,
   *     ... (Other fields specific to the individual course material type)
   *   }>,
   *   can_modify: boolean
   * }
   * error response: { errors: Array.<string> }
   */
  addParentNode(params) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/add_parent_node`,
      params,
    );
  }

  /**
   * Removes the specified parent node from the specified node.
   *
   * @return {Promise}
   * success response: {
   *   nodes: Array.<{
   *     id: string, unlocked: boolean, satisfiability_type: string,
   *     course_material_type: string, content_url: string,
   *     children: Array.<{ id: string, is_satisfied: boolean }>,
   *     parents: Array.<{ id: string, is_satisfied: boolean }>,
   *     unlock_rate: number, unlock_level: number,
   *     ... (Other fields specific to the individual course material type)
   *   }>,
   *   can_modify: boolean
   * }
   * error response: { errors: Array.<string> }
   */
  removeParentNode(params) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/remove_parent_node`,
      params,
    );
  }

  /**
   * Toggles the satisfiability type for the specified node.
   *
   * @return {Promise}
   * success response: {
   *   nodes: Array.<{
   *     id: string, unlocked: boolean, satisfiability_type: string,
   *     course_material_type: string, content_url: string,
   *     children: Array.<{ id: string, is_satisfied: boolean }>,
   *     parents: Array.<{ id: string, is_satisfied: boolean }>,
   *     unlock_rate: number, unlock_level: number,
   *     ... (Other fields specific to the individual course material type)
   *   }>,
   *   can_modify: boolean
   * }
   * error response: { errors: Array.<string> }
   */
  toggleSatisfiabilityType(params) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/toggle_satisfiability_type`,
      params,
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/learning_map`;
  }
}
