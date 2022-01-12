import BaseCourseAPI from './Base';

export default class GroupsAPI extends BaseCourseAPI {
  /**
   * Fetches an array of all group categories and groups in the course, along with a list of all users in the course.
   *
   * @return {Promise}
   * - Success response: {
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
   *   users: [course users]
   * }
   * - Error response: { error: string }
   */
  fetch() {
    return this.getClient().get(`${this._getUrlPrefix()}`);
  }

  /**
   * Creates a group category.
   * @param {object} params In the form of { name: string }.
   * @returns {Promise}
   * - Success response: category object
   * - Error response: { error: string }
   */
  createCategory(params) {
    return this.getClient().post(`${this._getUrlPrefix()}`, params);
  }

  /**
   * Creates a group under a specified category.
   * @param {string | number} categoryId ID of the category to create the group under.
   * @param {object} params In the form of { name: string, members: [{ id: number, role: 'member' | 'normal' }] }.
   * @returns {Promise}
   * - Success response: group object
   * - Error response: { error: string }
   */
  createGroup(categoryId, params) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${categoryId}/groups`,
      params,
    );
  }

  /**
   * Updates the category.
   * @param {string | number} categoryId ID of the category to update.
   * @param {object} params In the form of { name: string }
   * @returns {Promise}
   * - Success response: category object
   * - Error response: { error: string }
   */
  updateCategory(categoryId, params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${categoryId}`,
      params,
    );
  }

  /**
   * Updates the group. To be used for one-shot mass updates. Else, look into addMember, updateMember
   * and deleteMember instead.
   * @param {string | number} categoryId ID of the category that the group belongs to.
   * @param {string | number} groupId ID of the group to update.
   * @param {object} params In the form of { name: string, members: [{ id: number, role: 'manager' | 'normal' }] }
   * @returns {Promise}
   * - Success response: group object
   * - Error response: { error: string }
   */
  updateGroup(categoryId, groupId, params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${categoryId}/groups/${groupId}`,
      params,
    );
  }

  /**
   * Adds a single member to a specified group.
   * @param {string | number} categoryId ID of the category that the group belongs to.
   * @param {string | number} groupId ID of the group to add the user to.
   * @param {object} params In the form of { id: number, role: 'manager' | 'normal' }, where id is the user id to add.
   * @returns {Promise}
   * - Success response: user object with role
   * - Error response: { error: string }
   */
  addMember(categoryId, groupId, params) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${categoryId}/groups/${groupId}/members`,
      params,
    );
  }

  /**
   * Updates a single member to a specified group.
   * @param {string | number} categoryId ID of the category that the group belongs to.
   * @param {string | number} groupId ID of the group the user belongs to.
   * @param {string | number} userId ID of the user to update.
   * @param {object} params In the form of { role: 'manager' | 'normal' }, where id is the user id to update.
   * @returns {Promise}
   * - Success response: user object with role
   * - Error response: { error: string }
   */
  updateMember(categoryId, groupId, memberId, params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${categoryId}/groups/${groupId}/members/${memberId}`,
      params,
    );
  }

  /**
   * Deletes a single member to a specified group.
   * @param {string | number} categoryId ID of the category that the group belongs to.
   * @param {string | number} groupId ID of the group the user belongs to.
   * @param {string | number} userId ID of the user to delete.
   * @returns {Promise}
   * - Success response: deleted user object with role
   * - Error response: { error: string }
   */
  deleteMember(categoryId, groupId, memberId) {
    return this.getClient().delete(
      `${this._getUrlPrefix()}/${categoryId}/groups/${groupId}/members/${memberId}`,
    );
  }

  /**
   * Deletes a group.
   * @param {string | number} categoryId ID of the category that the group belongs to.
   * @param {string | number} groupId ID of the category the group to delete.
   * @returns {Promise}
   * - Success response: deleted group object
   * - Error response: { error: string }
   */
  deleteGroup(categoryId, groupId) {
    return this.getClient().delete(
      `${this._getUrlPrefix()}/${categoryId}/groups/${groupId}`,
    );
  }

  /**
   * Deletes a category.
   * @param {string | number} categoryId ID of the category to delete.
   * @returns {Promise}
   * - Success response: deleted category object
   * - Error response: { error: string }
   */
  deleteCategory(categoryId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${categoryId}`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/groups`;
  }
}
