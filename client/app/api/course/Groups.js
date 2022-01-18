import BaseCourseAPI from './Base';

export default class GroupsAPI extends BaseCourseAPI {
  /**
   * Fetches an array of a given category and its groups.
   *
   * @param {number | string} groupCategoryId - Category to fetch.
   * @return {Promise}
   * - Success response: {
   *   groupCategory: category object
   *   groups: [{
   *     name: string,
   *     groups: [{
   *       name: string,
   *       members: [{
   *         // student details
   *         role: 'manager' | 'normal'
   *       }]
   *     }]
   *   }],
   * }
   * - Error response: { error: string }
   */
  fetch(groupCategoryId) {
    return this.getClient().get(
      `${this._getUrlPrefix()}/${groupCategoryId}/info`,
    );
  }

  /**
   * Fetches an array of users in this course.
   *
   * @return {Promise}
   * - Success response: {
   *   users: [CourseUser],
   * }
   * - Error response: { error: string }
   */
  fetchCourseUsers() {
    return this.getClient().get(`${this._getUrlPrefix()}/users`);
  }

  /**
   * Creates a group category.
   * @param {object} params In the form of { name: string, description: string? }.
   * @returns {Promise}
   * - Success response: { id: number | string }
   * - Error response: { errors: string[] }
   */
  createCategory(params) {
    return this.getClient().post(`${this._getUrlPrefix()}`, params);
  }

  /**
   * Creates a group under a specified category.
   * @param {string | number} categoryId ID of the category to create the group under.
   * @param {object} params In the form of { name: string, description: string? }[].
   * @returns {Promise}
   * - Success response: group object
   * - Error response: { error: string }
   */
  createGroups(categoryId, params) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${categoryId}/groups`,
      params,
    );
  }

  /**
   * Updates the category.
   * @param {string | number} categoryId ID of the category to update.
   * @param {object} params In the form of { name: string, description: string? }
   * @returns {Promise}
   * - Success response: { id: number | string }
   * - Error response: { errors: string[] }
   */
  updateCategory(categoryId, params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${categoryId}`,
      params,
    );
  }

  /**
   * Updates the group.
   * @param {string | number} categoryId ID of the category to update.
   * @param {object} params In the form of { name: string, description: string? }
   * @returns {Promise}
   * - Success response: { id: number | string }
   * - Error response: { errors: string[] }
   */
  updateGroup(groupId, params) {
    return this.getClient().patch(`${this._getUrlPrefix()}/group`, {
      ...params,
      group_id: groupId,
    });
  }

  /**
   * Updates the group members of a single category. Only "dirty" groups, i.e. groups
   * modified should be included here.
   * @param {string | number} categoryId ID of the category to update.
   * @param {object} params In the form of {
   *   groups: {
   *     id: number | string,
   *     members: {
   *       id: number | string, - CourseUser id,
   *       role: 'normal' | 'manager'
   *     }[]
   *   }[],
   * }
   * @returns {Promise}
   * - Success response: { id: number | string }
   * - Error response: { error: string }
   */
  updateGroupMembers(categoryId, params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/group_members?group_category=${categoryId}`,
      params,
    );
  }

  /**
   * Deletes a group.
   * @param {string | number} categoryId ID of the category that the group belongs to.
   * @param {string | number} groupId ID of the category the group to delete.
   * @returns {Promise}
   * - Success response: { id: number | string }
   * - Error response: { error: string }
   */
  deleteGroup(groupId) {
    return this.getClient().delete(`${this._getUrlPrefix()}?group=${groupId}`);
  }

  /**
   * Deletes a category.
   * @param {string | number} categoryId ID of the category to delete.
   * @returns {Promise}
   * - Success response: { id: number | string }
   * - Error response: { error: string }
   */
  deleteCategory(categoryId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${categoryId}`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/groups`;
  }
}
