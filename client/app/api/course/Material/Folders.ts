import { FolderData, MaterialListData } from 'types/course/material/folders';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class FoldersAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/materials/folders`;
  }

  /**
   * Fetches a folder, along with all its subfolders and materials.
   * If `folderId` is not provided, fetches the root folder.
   */
  fetch(folderId?: number): APIResponse<FolderData> {
    return this.client.get(`${this.#urlPrefix}/${folderId ?? ''}`);
  }

  /**
   * Creates a new folder
   */
  createFolder(folderId: number, params: FormData): APIResponse<FolderData> {
    return this.client.post(
      `${this.#urlPrefix}/${folderId}/create/subfolder`,
      params,
    );
  }

  /**
   * Updates a new folder
   */
  updateFolder(folderId: number, params: FormData): APIResponse<FolderData> {
    return this.client.patch(`${this.#urlPrefix}/${folderId}`, params);
  }

  /**
   * Deletes a folder
   */
  deleteFolder(folderId: number): APIResponse {
    return this.client.delete(`${this.#urlPrefix}/${folderId}`);
  }

  /**
   * Deletes a material (file)
   */
  deleteMaterial(currFolderId: number, materialId: number): APIResponse {
    return this.client.delete(
      `${this.#urlPrefix}/${currFolderId}/files/${materialId}`,
    );
  }

  /**
   * Chunks a material (file)
   */
  chunkMaterial(
    currFolderId: number,
    materialId: number,
  ): APIResponse<JobSubmitted> {
    return this.client.put(
      `${this.#urlPrefix}/${currFolderId}/files/${materialId}/create_text_chunks`,
    );
  }

  /**
   * Deletes Chunks associated with a material (file)
   */
  deleteMaterialChunks(currFolderId: number, materialId: number): APIResponse {
    return this.client.delete(
      `${this.#urlPrefix}/${currFolderId}/files/${materialId}/destroy_text_chunks`,
    );
  }

  /**
   * Uploads materials (files)
   */
  uploadMaterials(
    currFolderId: number,
    params: FormData,
  ): APIResponse<FolderData> {
    return this.client.put(
      `${this.#urlPrefix}/${currFolderId}/upload_materials`,
      params,
    );
  }

  /**
   * Updates a material (file)
   */
  updateMaterial(
    folderId: number,
    materialId: number,
    params: FormData,
  ): APIResponse<MaterialListData> {
    return this.client.patch(
      `${this.#urlPrefix}/${folderId}/files/${materialId}`,
      params,
    );
  }

  /**
   * Downloads an entire folder and its contents
   */
  downloadFolder(currFolderId: number): APIResponse<JobSubmitted> {
    return this.client.get(`${this.#urlPrefix}/${currFolderId}/download`);
  }
}
