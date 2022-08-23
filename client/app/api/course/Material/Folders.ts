import { AxiosResponse } from 'axios';
import pollJob from 'lib/helpers/job-helpers';
import { FolderData } from 'types/course/material/folders';
import BaseCourseAPI from '../Base';

export default class FoldersAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/materials/folders`;
  }

  /**
   * Fetches a folder, along with all its subfolders and materials.
   */
  fetch(folderId: number): Promise<AxiosResponse<FolderData>> {
    return this.getClient().get(`${this._getUrlPrefix()}/${folderId}`);
  }

  /**
   * Creates a new folder
   */
  createFolder(
    folderId: number,
    params: FormData,
  ): Promise<AxiosResponse<FolderData>> {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${folderId}/create/subfolder`,
      params,
    );
  }

  /**
   * Updates a new folder
   */
  updateFolder(
    folderId: number,
    params: FormData,
  ): Promise<AxiosResponse<FolderData>> {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${folderId}`,
      params,
    );
  }

  /**
   * Deletes a folder
   */
  deleteFolder(folderId: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this._getUrlPrefix()}/${folderId}`);
  }

  /**
   * Deletes a material (file)
   */
  deleteMaterial(
    currFolderId: number,
    materialId: number,
  ): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${this._getUrlPrefix()}/${currFolderId}/files/${materialId}`,
    );
  }

  /**
   * Uploads materials (files)
   */
  uploadMaterials(
    currFolderId: number,
    params: FormData,
  ): Promise<AxiosResponse> {
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
  ): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${folderId}/files/${materialId}`,
      params,
    );
  }

  /**
   * Downloads an entire folder and its contents
   */
  downloadFolder(
    currFolderId: number,
    onSuccess: () => void,
    onFailure: () => void,
  ): Promise<void> {
    const REQUEST_INTERVAL = 1000;
    return this.getClient()
      .get(`${this._getUrlPrefix()}/${currFolderId}/download`)
      .then((response) => {
        pollJob(
          response.data.redirect_url,
          REQUEST_INTERVAL,
          (data) => {
            onSuccess();
            window.open(data.redirect_url);
          },
          onFailure,
        );
      })
      .catch((error) => {
        throw error;
      });
  }
}
