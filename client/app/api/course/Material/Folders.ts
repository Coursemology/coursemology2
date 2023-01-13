import { FolderData, MaterialListData } from 'types/course/material/folders';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class FoldersAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/materials/folders`;
  }

  /**
   * Fetches a folder, along with all its subfolders and materials.
   */
  fetch(folderId: number): APIResponse<FolderData> {
    return this.getClient().get(`${this._getUrlPrefix()}/${folderId}`);
  }

  /**
   * Creates a new folder
   */
  createFolder(folderId: number, params: FormData): APIResponse<FolderData> {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${folderId}/create/subfolder`,
      params,
    );
  }

  /**
   * Updates a new folder
   */
  updateFolder(folderId: number, params: FormData): APIResponse<FolderData> {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${folderId}`,
      params,
    );
  }

  /**
   * Deletes a folder
   */
  deleteFolder(folderId: number): APIResponse {
    return this.getClient().delete(`${this._getUrlPrefix()}/${folderId}`);
  }

  /**
   * Deletes a material (file)
   */
  deleteMaterial(currFolderId: number, materialId: number): APIResponse {
    return this.getClient().delete(
      `${this._getUrlPrefix()}/${currFolderId}/files/${materialId}`,
    );
  }

  /**
   * Uploads materials (files)
   */
  uploadMaterials(currFolderId: number, params: FormData): APIResponse {
    return this.getClient().put(
      `${this._getUrlPrefix()}/${currFolderId}/upload_materials`,
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
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${folderId}/files/${materialId}`,
      params,
    );
  }

  /**
   * Downloads an entire folder and its contents
   */
  downloadFolder(currFolderId: number): APIResponse<JobSubmitted> {
    return this.getClient().get(
      `${this._getUrlPrefix()}/${currFolderId}/download`,
    );
  }
}
