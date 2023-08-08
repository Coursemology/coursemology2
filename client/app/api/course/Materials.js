import BaseCourseAPI from './Base';

export default class MaterialsAPI extends BaseCourseAPI {
  get #urlPrefix() {
    return `/courses/${this.courseId}/materials/folders`;
  }

  /**
   * @param {number} folderId
   * @param {number} materialId
   * @returns {import('api/types').APIResponse<import('api/types').JustRedirect>}
   */
  fetch(folderId, materialId) {
    return this.client.get(
      `${this.#urlPrefix}/${folderId}/files/${materialId}`,
    );
  }

  /**
   * Destroy the material.
   *
   * @param {number} folderId
   * @param {numbrt} materialId
   * @return {Promise}
   * success response: {}
   * error response: { message:string }
   */
  destroy(folderId, materialId) {
    return this.client.delete(
      `${this.#urlPrefix}/${folderId}/files/${materialId}`,
    );
  }
}
