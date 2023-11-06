import { APIResponse, JustRedirect } from 'api/types';

import BaseCourseAPI from './Base';

export default class MaterialsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/materials/folders`;
  }

  fetch(folderId: number, materialId: number): APIResponse<JustRedirect> {
    return this.client.get(
      `${this.#urlPrefix}/${folderId}/files/${materialId}`,
    );
  }

  destroy(folderId: number, materialId: number): APIResponse {
    return this.client.delete(
      `${this.#urlPrefix}/${folderId}/files/${materialId}`,
    );
  }
}
