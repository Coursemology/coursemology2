import BaseCourseAPI from './Base';

export default class LearningMapAPI extends BaseCourseAPI {
  /**
   * Fetches all nodes in the learning map for the current user and course.
   *
   * @return {Promise}
   * success response: {
   *   nodes: Array.<{
   *     id: string, unlocked: boolean, satisfiabilityType: string,
   *     courseMaterialType: string, contentUrl: string,
   *     children: Array.<{ id: string, isSatisfied: boolean }>,
   *     parents: Array.<{ id: string, isSatisfied: boolean }>,
   *     unlockRate: number, unlockLevel: number,
   *     ... (Other fields specific to the individual course material type)
   *   }>,
   *   canModify: boolean
   * }
   * error response: { errors: Array.<string> }
   */
  index() {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Adds a parent node to the specified node.
   *
   * @return {Promise}
   * success response: {
   *   nodes: Array.<{
   *     id: string, unlocked: boolean, satisfiabilityType: string,
   *     courseMaterialType: string, contentUrl: string,
   *     children: Array.<{ id: string, isSatisfied: boolean }>,
   *     parents: Array.<{ id: string, isSatisfied: boolean }>,
   *     unlockRate: number, unlockLevel: number,
   *     ... (Other fields specific to the individual course material type)
   *   }>,
   *   canModify: boolean
   * }
   * error response: { errors: Array.<string> }
   */
  addParentNode(params) {
    return this.client.post(`${this.#urlPrefix}/add_parent_node`, params);
  }

  /**
   * Removes the specified parent node from the specified node.
   *
   * @return {Promise}
   * success response: {
   *   nodes: Array.<{
   *     id: string, unlocked: boolean, satisfiabilityType: string,
   *     courseMaterialType: string, contentUrl: string,
   *     children: Array.<{ id: string, isSatisfied: boolean }>,
   *     parents: Array.<{ id: string, isSatisfied: boolean }>,
   *     unlockRate: number, unlockLevel: number,
   *     ... (Other fields specific to the individual course material type)
   *   }>,
   *   canModify: boolean
   * }
   * error response: { errors: Array.<string> }
   */
  removeParentNode(params) {
    return this.client.post(`${this.#urlPrefix}/remove_parent_node`, params);
  }

  /**
   * Toggles the satisfiability type for the specified node.
   *
   * @return {Promise}
   * success response: {
   *   nodes: Array.<{
   *     id: string, unlocked: boolean, satisfiabilityType: string,
   *     courseMaterialType: string, contentUrl: string,
   *     children: Array.<{ id: string, isSatisfied: boolean }>,
   *     parents: Array.<{ id: string, isSatisfied: boolean }>,
   *     unlockRate: number, unlockLevel: number,
   *     ... (Other fields specific to the individual course material type)
   *   }>,
   *   canModify: boolean
   * }
   * error response: { errors: Array.<string> }
   */
  toggleSatisfiabilityType(params) {
    return this.client.post(
      `${this.#urlPrefix}/toggle_satisfiability_type`,
      params,
    );
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/learning_map`;
  }
}
