import { FolderData, MaterialListData } from 'types/course/material/folders';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class FoldersAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.getCourseId()}/materials/folders`;
  }

  /**
   * Fetches a folder, along with all its subfolders and materials.
   */
  fetch(folderId: number): APIResponse<FolderData> {
    return this.client.get(`${this.#urlPrefix}/${folderId}`);
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
