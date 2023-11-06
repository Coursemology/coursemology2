import { FileListData } from 'types/course/material/files';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class MaterialsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/materials/folders`;
  }

  fetch(folderId: number, materialId: number): APIResponse<FileListData> {
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
