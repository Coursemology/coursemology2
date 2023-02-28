import BaseCourseAPI from './Base';

export default class MaterialsAPI extends BaseCourseAPI {
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

  get #urlPrefix() {
    return `/courses/${this.courseId}/materials/folders`;
  }
}
