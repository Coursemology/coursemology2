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
    return this.client.get(`${this.#urlPrefix}/${groupCategoryId}/info`);
  }

  /**
   * Fetches an array of a group categories.
   *
   * @return {Promise}
   * - Success response: {
   *   groupCategories: [{
   *     id: number,
   *     name: string,
   *   }],
   *   permissions: permission object
   * }
   * - Error response: { error: string }
   */
  fetchGroupCategories() {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Fetches an array of users in this course.
   *
   * @param {number | string} groupCategoryId - Category that we're fetching users for.
   * @return {Promise}
   * - Success response: {
   *   users: [CourseUser],
   * }
   * - Error response: { error: string }
   */
  fetchCourseUsers(groupCategoryId) {
    return this.client.get(`${this.#urlPrefix}/${groupCategoryId}/users`);
  }

  /**
   * Creates a group category.
   * @param {object} params In the form of { name: string, description: string? }.
   * @returns {Promise}
   * - Success response: { id: number | string }
   * - Error response: { errors: string[] }
   */
  createCategory(params) {
    return this.client.post(`${this.#urlPrefix}`, params);
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
    return this.client.post(`${this.#urlPrefix}/${categoryId}/groups`, params);
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
    return this.client.patch(`${this.#urlPrefix}/${categoryId}`, params);
  }

  /**
   * Updates the group.
   * @param {string | number} categoryId ID of the category to update.
   * @param {object} params In the form of { name: string, description: string? }
   * @returns {Promise}
   * - Success response: { id: number | string }
   * - Error response: { errors: string[] }
   */
  updateGroup(categoryId, groupId, params) {
    return this.client.patch(
      `${this.#urlPrefix}/${categoryId}/groups/${groupId}`,
      params,
    );
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
    return this.client.patch(
      `${this.#urlPrefix}/${categoryId}/group_members`,
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
  deleteGroup(categoryId, groupId) {
    return this.client.delete(
      `${this.#urlPrefix}/${categoryId}/groups/${groupId}`,
    );
  }

  /**
   * Deletes a category.
   * @param {string | number} categoryId ID of the category to delete.
   * @returns {Promise}
   * - Success response: { id: number | string }
   * - Error response: { error: string }
   */
  deleteCategory(categoryId) {
    return this.client.delete(`${this.#urlPrefix}/${categoryId}`);
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/groups`;
  }
}
